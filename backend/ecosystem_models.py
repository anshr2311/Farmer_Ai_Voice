from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

Practice = Literal['water-saving', 'compost', 'cover-crop', 'residue-retention', 'no-till', 'agroforestry']
Country = Literal['IN', 'BR', 'RU', 'CN', 'ZA']

class LedgerCreate(BaseModel):
    client_id: str = Field(pattern=r'^[a-zA-Z0-9-]{16,80}$')
    practice: Practice
    field_id: Literal['field-01', 'field-02', 'field-03'] = 'field-01'
    area_acres: float = Field(gt=0, le=1000)
    performed_on: date
    evidence: str = Field(min_length=10, max_length=1000)

    @field_validator('performed_on')
    @classmethod
    def past_date(cls, value):
        if value > date.today():
            raise ValueError('Activity date cannot be in the future.')
        return value

    @field_validator('evidence')
    @classmethod
    def real_text(cls, value):
        if len(value.strip()) < 10:
            raise ValueError('Add at least 10 characters of activity evidence.')
        return value.strip()

class DemoInterest(BaseModel):
    id: str
    offer_id: str
    buyer: str
    units: float
    indicative_value_inr: float
    created_at: str
    status: str = 'demo_interest_only'

class LedgerRecord(LedgerCreate):
    id: str
    status: Literal['recorded', 'demo_verified', 'listed'] = 'recorded'
    created_at: str
    verified_at: Optional[str] = None
    demo_units: float = 0
    interest: Optional[DemoInterest] = None
    verification_method: str = 'Illustrative self-declared workflow; not independently certified'

class Acknowledge(BaseModel):
    acknowledge_demo: Literal[True]

class InterestInput(Acknowledge):
    record_id: str
    offer_id: Literal['soil-partners', 'regen-alliance', 'water-collective']

class NetworkInput(BaseModel):
    record_id: str
    client_id: str = Field(pattern=r'^[a-zA-Z0-9-]{16,80}$')
    origin: Country = 'IN'
    destination: Country = 'BR'
    consent: Literal[True]
    preview: bool = False

    @model_validator(mode='after')
    def countries_differ(self):
        if self.origin == self.destination:
            raise ValueError('Choose a different destination country.')
        return self

class Exchange(BaseModel):
    id: str
    origin: str
    destination: str
    record_id: str
    envelope: dict
    created_at: str
    status: str = 'simulated_exchange'
    actual_cross_border_transfer: bool = False

class AdvisoryInput(BaseModel):
    crop: Literal['Wheat', 'Rice', 'Maize', 'Tomato', 'Mustard'] = 'Wheat'
    stage: Literal['Sowing', 'Vegetative', 'Flowering', 'Harvest'] = 'Flowering'
    soil: Literal['Loam', 'Clay', 'Sandy'] = 'Loam'
    location: str = Field(default='Bareilly', min_length=2, max_length=100)
    moisture: int = Field(default=38, ge=0, le=100)
    rain_probability: int = Field(default=72, ge=0, le=100)
    crop_health: int = Field(default=82, ge=0, le=100)
    previous_activity: Literal['None', 'Irrigated recently', 'Compost applied', 'Mulch applied'] = 'None'

    @field_validator('location')
    @classmethod
    def location_not_blank(cls, value):
        if len(value.strip()) < 2:
            raise ValueError('Please provide a location.')
        return value.strip()

class AdvisoryResult(BaseModel):
    action: str
    title: str
    title_hi: str
    recommendation: str
    recommendation_hi: str
    saving_percent: int
    reasons: list[str]
    reasons_hi: list[str]
    inputs: AdvisoryInput
    sample: bool = True
    engine: str = 'Explainable prototype rules, not live AI or weather data'

class Overview(BaseModel):
    farmer: str
    area_acres: float
    location: str
    crop: str
    soil_health: int = 78
    water_efficiency: int = 82
    recorded_practices: int
    demo_verified_records: int
    available_demo_units: float
    sample_metrics: bool = True