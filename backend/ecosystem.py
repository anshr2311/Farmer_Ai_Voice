import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Header, HTTPException
from pymongo import ReturnDocument
from ecosystem_models import LedgerCreate, LedgerRecord, Acknowledge, InterestInput, DemoInterest, NetworkInput, Exchange, AdvisoryInput, AdvisoryResult, Overview
from ecosystem_data import FIELDS, OFFERS, FACTORS, analytics_data, recommendation

def make_ecosystem_router(db, current_user):
    router = APIRouter(prefix='/api/ecosystem')
    def stamp():
        return datetime.now(timezone.utc).isoformat()

    async def owner(authorization, workspace):
        if authorization:
            return 'user:' + (await current_user(authorization))['id']
        if not workspace or len(workspace) < 32 or len(workspace) > 100:
            raise HTTPException(401, 'A private device workspace or profile is required.')
        return 'device:' + hashlib.sha256(workspace.encode()).hexdigest()

    @router.get('/monitoring')
    async def monitoring():
        return {'sample': True, 'location': 'Bareilly · illustrative landscape', 'dates': ['2026-02-01', '2026-02-15', '2026-03-01'], 'fields': FIELDS, 'image': '/assets/field-aerial.jpg', 'source': 'Reference aerial photograph with illustrative boundaries and synthetic NDVI; not an actual satellite observation of your farm.'}

    @router.post('/advisory', response_model=AdvisoryResult)
    async def advisory(values: AdvisoryInput):
        return recommendation(values)

    @router.get('/analytics')
    async def analytics(season: str = 'current'):
        if season not in ('current', 'previous'):
            raise HTTPException(400, 'Choose current or previous sample season.')
        return analytics_data(season)

    @router.get('/overview', response_model=Overview)
    async def overview(authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        user = await current_user(authorization) if authorization else None
        records = await db.regeneration.find({'owner': who}, {'_id': 0}).to_list(1000)
        farm = user['farm'] if user else {'area': 4.2, 'district': 'Bareilly', 'crop': 'Wheat'}
        return Overview(farmer=user['name'] if user else 'Ramesh Kumar · sample farmer', area_acres=farm['area'], location=farm['district'], crop=farm['crop'], recorded_practices=len(records), demo_verified_records=sum(r['status'] != 'recorded' for r in records), available_demo_units=round(sum(r['demo_units'] for r in records if r['status'] == 'demo_verified'), 2))

    @router.get('/ledger', response_model=List[LedgerRecord])
    async def ledger(authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        return await db.regeneration.find({'owner': who}, {'_id': 0, 'owner': 0}).sort('created_at', -1).to_list(1000)

    @router.post('/ledger', response_model=LedgerRecord)
    async def add_record(body: LedgerCreate, authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        record = LedgerRecord(**body.model_dump(), id=body.client_id, created_at=stamp())
        # Deterministic scoped _id makes replay after reconnection idempotent.
        key = hashlib.sha256((who + ':' + body.client_id).encode()).hexdigest()
        await db.regeneration.update_one({'_id': key}, {'$setOnInsert': {**record.model_dump(mode='json'), 'owner': who}}, upsert=True)
        return await db.regeneration.find_one({'_id': key}, {'_id': 0, 'owner': 0})

    @router.post('/ledger/{record_id}/verify', response_model=LedgerRecord)
    async def verify(record_id: str, body: Acknowledge, authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        record = await db.regeneration.find_one({'owner': who, 'id': record_id}, {'_id': 0})
        if not record:
            raise HTTPException(404, 'Activity not found in your workspace.')
        if record['status'] == 'recorded':
            units = round(record['area_acres'] * FACTORS[record['practice']], 2)
            await db.regeneration.update_one({'owner': who, 'id': record_id, 'status': 'recorded'}, {'$set': {'status': 'demo_verified', 'demo_units': units, 'verified_at': stamp()}})
        return await db.regeneration.find_one({'owner': who, 'id': record_id}, {'_id': 0, 'owner': 0})

    @router.get('/offers')
    async def offers():
        return {'offers': OFFERS, 'sample': True, 'disclaimer': 'Fictional buyers and indicative demo units, not certified carbon credits or financial offers.'}

    @router.post('/interests', response_model=DemoInterest)
    async def interest(body: InterestInput, authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        record = await db.regeneration.find_one({'owner': who, 'id': body.record_id}, {'_id': 0})
        if not record:
            raise HTTPException(404, 'Activity not found.')
        if record['status'] != 'demo_verified':
            raise HTTPException(409, 'Only an unlisted, demo-verified activity can record interest.')
        offer = next(o for o in OFFERS if o['id'] == body.offer_id)
        if record['demo_units'] < offer['minimum']:
            raise HTTPException(400, 'This illustrative offer requires at least 0.1 demo units.')
        result = DemoInterest(id='DEMO-' + secrets.token_hex(5).upper(), offer_id=offer['id'], buyer=offer['name'], units=record['demo_units'], indicative_value_inr=round(record['demo_units'] * offer['rate'], 2), created_at=stamp())
        changed = await db.regeneration.find_one_and_update({'owner': who, 'id': body.record_id, 'status': 'demo_verified'}, {'$set': {'status': 'listed', 'interest': result.model_dump()}}, projection={'_id': 0}, return_document=ReturnDocument.AFTER)
        if not changed:
            raise HTTPException(409, 'Interest was already recorded for this activity.')
        return result

    @router.get('/exchanges', response_model=List[Exchange])
    async def exchanges(authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        return await db.agri_exchanges.find({'owner': who}, {'_id': 0, 'owner': 0}).sort('created_at', -1).to_list(100)

    @router.post('/exchanges', response_model=Exchange)
    async def exchange(body: NetworkInput, authorization: Optional[str] = Header(None), x_workspace_key: Optional[str] = Header(None)):
        who = await owner(authorization, x_workspace_key)
        record = await db.regeneration.find_one({'owner': who, 'id': body.record_id}, {'_id': 0})
        if not record or record['status'] == 'recorded':
            raise HTTPException(400, 'Select a demo-verified activity from your own workspace.')
        envelope = {'schema': 'agrin.prototype/1.0', 'schema_status': 'Proposed demo schema, not an official BRICS standard', 'farm_ref': hashlib.sha256(who.encode()).hexdigest()[:12], 'origin_country': body.origin, 'destination_country': body.destination, 'practice_code': record['practice'].upper().replace('-', '_'), 'area': {'value': round(record['area_acres'] * 0.40468564224, 4), 'unit': 'hectare'}, 'activity_date': record['performed_on'], 'verification': 'demo_only_not_certified', 'consent': True, 'personal_information_included': False}
        result = Exchange(id=body.client_id, origin=body.origin, destination=body.destination, record_id=body.record_id, envelope=envelope, created_at=stamp())
        if body.preview:
            return result
        key = hashlib.sha256((who + ':' + body.client_id).encode()).hexdigest()
        await db.agri_exchanges.update_one({'_id': key}, {'$setOnInsert': {**result.model_dump(), 'owner': who}}, upsert=True)
        return await db.agri_exchanges.find_one({'_id': key}, {'_id': 0, 'owner': 0})
    return router