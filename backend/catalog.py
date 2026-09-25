from pydantic import BaseModel

class Product(BaseModel):
    id: str
    name: str
    name_hi: str
    category: str
    badge: str
    price: int
    mrp: int
    unit: str
    image: str
    description: str
    guide: list[str]
    sample: bool = True

NEEM = '/assets/neem.jpeg'
GROW = '/assets/grow.jpeg'
SEED = '/assets/seeds.jpeg'
GUIDE = ['Confirm the crop, pest and product registration with a local agricultural expert.', 'Use only the crop-specific per-acre dose and dilution printed on the registered product label. These illustrative products have no verified dosage.', 'Wear gloves, long sleeves and appropriate protection. Avoid windy weather and water bodies.', 'Observe the label’s re-entry and pre-harvest intervals. Keep away from children and livestock.']
PRODUCTS = [
    dict(id='neem-bio', name='Neem Bio Protect', name_hi='नीम बायो प्रोटेक्ट', category='Bio-Insecticides', badge='Organic', price=450, mrp=550, unit='500 ml', image=NEEM, description='Neem-based crop care · Illustrative product', guide=GUIDE),
    dict(id='plant-grow', name='Grow Plant Nutrition', name_hi='ग्रो प्लांट न्यूट्रिशन', category='Organic Fertilizers', badge='Growth Promoter', price=680, mrp=850, unit='1 litre', image=GROW, description='Balanced plant nutrition · Illustrative product', guide=GUIDE),
    dict(id='hybrid-maize', name='Kisan Hybrid Maize', name_hi='किसान हाइब्रिड मक्का', category='High-Yield Seeds', badge='High Yield', price=920, mrp=1150, unit='1 kg', image=SEED, description='Hybrid maize seeds · Illustrative product', guide=['Choose seed suitable for your soil, climate and sowing season.', 'Confirm germination rate and recommended seed quantity per acre on the seed packet.', 'Prepare a well-drained seedbed and use locally recommended spacing.', 'Consult your local Krishi Vigyan Kendra for a crop-specific sowing plan.']),
    dict(id='crop-shield', name='Crop Shield', name_hi='क्रॉप शील्ड', category='Pesticides', badge='Chemical', price=520, mrp=650, unit='500 ml', image=NEEM, description='Crop protection · Illustrative packaging only', guide=GUIDE),
    dict(id='fungal-care', name='Fungal Care', name_hi='फंगल केयर', category='Fungicides', badge='Crop Protection', price=390, mrp=480, unit='250 ml', image=GROW, description='Fungal protection · Illustrative packaging only', guide=GUIDE),
    dict(id='organic-soil', name='Organic Soil Booster', name_hi='ऑर्गेनिक सॉइल बूस्टर', category='Organic Fertilizers', badge='Organic', price=320, mrp=400, unit='1 kg', image=SEED, description='Soil nutrition · Illustrative packaging only', guide=GUIDE),
]

class Price(BaseModel):
    id: str
    crop: str
    crop_hi: str
    emoji: str
    mandi: str
    price: int
    change: int
    unit: str = 'quintal'
    sample: bool = True

PRICES = [
    dict(id='wheat-b', crop='Wheat', crop_hi='गेहूँ', emoji='🌾', mandi='Bareilly', price=2425, change=75),
    dict(id='rice-b', crop='Paddy', crop_hi='धान', emoji='🌱', mandi='Bareilly', price=2320, change=40),
    dict(id='tomato-l', crop='Tomato', crop_hi='टमाटर', emoji='🍅', mandi='Lucknow', price=1850, change=-120),
    dict(id='potato-a', crop='Potato', crop_hi='आलू', emoji='🥔', mandi='Agra', price=1250, change=50),
    dict(id='maize-b', crop='Maize', crop_hi='मक्का', emoji='🌽', mandi='Bareilly', price=2225, change=25),
    dict(id='mustard-l', crop='Mustard', crop_hi='सरसों', emoji='🌼', mandi='Lucknow', price=5650, change=-80),
    dict(id='urea-b', crop='Urea', crop_hi='यूरिया', emoji='🌿', mandi='Bareilly', price=266, change=0, unit='45 kg bag'),
    dict(id='dap-a', crop='DAP Fertilizer', crop_hi='डीएपी खाद', emoji='🌿', mandi='Agra', price=1350, change=0, unit='50 kg bag'),
]

class Telemetry(BaseModel):
    temperature: int = 28
    humidity: int = 64
    rainfall: float = 2.4
    moisture: int = 42
    ph: float = 6.8
    nitrogen: int = 240
    phosphorus: int = 22
    potassium: int = 180
    ndvi: float = 0.78
    location: str = 'Bareilly, Uttar Pradesh'
    source: str = 'Illustrative telemetry — not connected to field sensors'
    sample: bool = True