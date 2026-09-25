import os
import secrets
import hashlib
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import FastAPI, APIRouter, HTTPException, Header, UploadFile, File, Form
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError
from models import LoginInput, SessionResponse, User, Farm, QueryInput, Advice, CallbackInput, RequestResult, OrderInput, ScanResult, HistoryItem
from catalog import PRODUCTS, PRICES, Product, Price, Telemetry
from advisory import make_advice
from ecosystem import make_ecosystem_router

load_dotenv(Path(__file__).parent / '.env.local', override=False)
load_dotenv(Path(__file__).parent / '.env', override=False)
client = AsyncIOMotorClient(os.environ['MONGO_URL'], serverSelectionTimeoutMS=5000)
db = client[os.environ['DB_NAME']]
app = FastAPI(title='KisanGyan API')
api = APIRouter(prefix='/api')
app.add_middleware(CORSMiddleware, allow_origins=[origin.strip().rstrip('/') for origin in os.environ['CORS_ORIGINS'].split(',') if origin.strip()], allow_credentials=False, allow_methods=['GET', 'POST', 'PUT', 'OPTIONS'], allow_headers=['Authorization', 'Content-Type', 'X-Workspace-Key'])

def now():
    return datetime.now(timezone.utc).isoformat()

async def current_user(authorization: Optional[str]):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Please open a demo profile first.')
    digest = hashlib.sha256(authorization[7:].encode()).hexdigest()
    session = await db.sessions.find_one({'token_hash': digest}, {'_id': 0})
    if not session or session['expires_at'] < now():
        raise HTTPException(401, 'Session expired. Please sign in again.')
    user = await db.users.find_one({'id': session['user_id']}, {'_id': 0})
    if not user:
        raise HTTPException(401, 'Profile not found.')
    return user

@api.get('/')
async def root():
    return {'name': 'KisanGyan', 'status': 'ready', 'data_mode': 'demonstration'}

@api.get('/health')
async def health():
    try:
        await db.command('ping')
    except PyMongoError:
        raise HTTPException(503, 'Database is unavailable. Check the database connection configuration.')
    return {'status': 'healthy', 'database': 'connected'}

@api.get('/products', response_model=List[Product])
async def products(category: str = '', search: str = ''):
    return [p for p in PRODUCTS if (not category or p['category'] == category) and search.casefold() in (p['name'] + p['name_hi']).casefold()]

@api.get('/prices', response_model=List[Price])
async def prices(search: str = '', mandi: str = ''):
    return [p for p in PRICES if (not mandi or p['mandi'] == mandi) and search.casefold() in (p['crop'] + p['crop_hi'] + p['mandi']).casefold()]

@api.get('/telemetry', response_model=Telemetry)
async def telemetry():
    return Telemetry()

@api.post('/auth/demo', response_model=SessionResponse)
async def demo_login(body: LoginInput):
    if body.provider == 'mobile' and body.otp != '123456':
        raise HTTPException(400, 'Demo OTP is 123456. No SMS is sent.')
    # Demo sessions are isolated: a guessed phone number never grants access to another user's data.
    user = User(id=secrets.token_hex(12), name=body.name, provider=body.provider, phone=body.phone)
    await db.users.insert_one(user.model_dump())
    token = secrets.token_urlsafe(32)
    await db.sessions.insert_one({'token_hash': hashlib.sha256(token.encode()).hexdigest(), 'user_id': user.id, 'expires_at': (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()})
    return SessionResponse(token=token, user=user)

@api.get('/auth/me', response_model=User)
async def me(authorization: Optional[str] = Header(None)):
    return await current_user(authorization)

@api.post('/auth/logout')
async def logout(authorization: Optional[str] = Header(None)):
    await current_user(authorization)
    await db.sessions.delete_one({'token_hash': hashlib.sha256(authorization[7:].encode()).hexdigest()})
    return {'success': True}

@api.put('/profile', response_model=User)
async def update_profile(body: Farm, authorization: Optional[str] = Header(None)):
    user = await current_user(authorization)
    await db.users.update_one({'id': user['id']}, {'$set': {'farm': body.model_dump()}})
    return await db.users.find_one({'id': user['id']}, {'_id': 0})

@api.post('/advice', response_model=Advice)
async def advice(body: QueryInput, authorization: Optional[str] = Header(None)):
    user = await current_user(authorization) if authorization else None
    answer = make_advice(body.question, body.language)
    result = Advice(id=body.client_id or secrets.token_hex(8), question=body.question, answer=answer, language=body.language, created_at=now())
    if user:
        key = hashlib.sha256((user['id'] + ':' + result.id).encode()).hexdigest()
        await db.history.update_one({'_id': key}, {'$setOnInsert': {**result.model_dump(), 'user_id': user['id'], 'type': 'voice'}}, upsert=True)
        return await db.history.find_one({'_id': key}, {'_id': 0, 'user_id': 0, 'type': 0})
    return result

@api.get('/history', response_model=List[HistoryItem])
async def history(authorization: Optional[str] = Header(None)):
    user = await current_user(authorization)
    return await db.history.find({'user_id': user['id']}, {'_id': 0, 'user_id': 0}).sort('created_at', -1).to_list(100)

@api.post('/callbacks', response_model=RequestResult)
async def callback(body: CallbackInput):
    result = RequestResult(id='KG-' + secrets.token_hex(4).upper(), created_at=now(), message='Request saved. This demonstration does not dispatch calls.')
    await db.callbacks.insert_one({**body.model_dump(), **result.model_dump()})
    return result

@api.post('/orders', response_model=RequestResult)
async def order(body: OrderInput):
    product = next((p for p in PRODUCTS if p['id'] == body.product_id), None)
    if not product:
        raise HTTPException(404, 'Product not found')
    result = RequestResult(id='KO-' + secrets.token_hex(4).upper(), created_at=now(), total=product['price'] * body.quantity, message='Product enquiry saved. No payment or delivery has been initiated.')
    await db.orders.insert_one({**body.model_dump(), **result.model_dump()})
    return result

@api.post('/scan', response_model=ScanResult)
async def scan(file: UploadFile = File(...), crop: str = Form('tomato'), authorization: Optional[str] = Header(None)):
    user = await current_user(authorization) if authorization else None
    if crop not in ('tomato', 'wheat', 'rice', 'maize'):
        raise HTTPException(400, 'Please select a supported crop.')
    if file.content_type not in ('image/jpeg', 'image/png', 'image/webp'):
        raise HTTPException(400, 'Use a JPG, PNG or WebP image.')
    content = await file.read(8 * 1024 * 1024 + 1)
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(413, 'Image must be smaller than 8 MB.')
    if not (content.startswith(b'\xff\xd8\xff') or content.startswith(b'\x89PNG\r\n\x1a\n') or (content.startswith(b'RIFF') and content[8:12] == b'WEBP')):
        raise HTTPException(400, 'This file is not a supported image.')
    samples = {'tomato': ('Early blight', 'अगेती झुलसा', 92), 'wheat': ('Leaf rust', 'पत्ती का रतुआ', 89), 'rice': ('Leaf blast', 'पत्ती झुलसा', 87), 'maize': ('Leaf blight', 'पत्ती झुलसा', 90)}
    disease, disease_hi, confidence = samples[crop]
    result = ScanResult(id=secrets.token_hex(8), disease=disease, disease_hi=disease_hi, confidence=confidence, crop=crop, filename=file.filename or 'image', created_at=now())
    if user:
        await db.history.insert_one({'id': result.id, 'user_id': user['id'], 'type': 'scan', 'question': f'{crop} — {result.filename}', 'answer': f'Demo report: {disease} ({confidence}% illustrative confidence). Not an actual image diagnosis.', 'created_at': result.created_at, 'language': 'en', 'simulated': True})
    return result

app.include_router(api)
app.include_router(make_ecosystem_router(db, current_user))

@app.on_event('shutdown')
async def shutdown():
    client.close()