from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Literal

class Farm(BaseModel):
    village: str = Field(default='', max_length=100)
    district: str = Field(default='Bareilly', min_length=1, max_length=100)
    crop: str = Field(default='Wheat', min_length=1, max_length=80)
    area: float = Field(default=2, gt=0, le=100000)

class User(BaseModel):
    id: str
    name: str
    provider: str
    phone: Optional[str] = None
    farm: Farm = Field(default_factory=Farm)
    demo: bool = True

class LoginInput(BaseModel):
    provider: Literal['mobile', 'google'] = 'mobile'
    name: str = Field(default='Kisan Saathi', min_length=1, max_length=80)
    phone: Optional[str] = Field(default=None, pattern=r'^[6-9]\d{9}$')
    otp: Optional[str] = None

    @model_validator(mode='after')
    def validate_mobile(self):
        if self.provider == 'mobile' and not self.phone:
            raise ValueError('Mobile number is required for the mobile demo.')
        return self

    @field_validator('name')
    @classmethod
    def clean_name(cls, value):
        if not value.strip():
            raise ValueError('Name cannot be blank')
        return value.strip()

class SessionResponse(BaseModel):
    token: str
    user: User

class QueryInput(BaseModel):
    client_id: Optional[str] = Field(default=None, pattern=r'^[a-zA-Z0-9-]{16,80}$')
    question: str = Field(min_length=3, max_length=1000)
    language: Literal['hi', 'en', 'mr', 'pa'] = 'hi'

    @field_validator('question')
    @classmethod
    def strip_question(cls, value):
        if len(value.strip()) < 3:
            raise ValueError('Please enter your farming question.')
        return value.strip()

class Advice(BaseModel):
    id: str
    question: str
    answer: str
    language: str
    created_at: str
    simulated: bool = True

class HistoryItem(Advice):
    type: Literal['voice', 'scan']

class CallbackInput(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(pattern=r'^[6-9]\d{9}$')
    topic: str = Field(min_length=2, max_length=120)
    preferred_time: str = Field(default='Morning (9 AM – 12 PM)', max_length=80)
    message: str = Field(default='', max_length=1000)
    consent: Literal[True]

    @field_validator('name', 'topic')
    @classmethod
    def nonblank(cls, value):
        if len(value.strip()) < 2:
            raise ValueError('Please enter at least two characters.')
        return value.strip()

class OrderInput(CallbackInput):
    product_id: str
    quantity: int = Field(ge=1, le=99)

class RequestResult(BaseModel):
    id: str
    created_at: str
    message: str
    status: str = 'saved_not_dispatched'
    total: Optional[int] = None

class ScanResult(BaseModel):
    id: str
    disease: str
    disease_hi: str
    confidence: int
    crop: str
    filename: str
    created_at: str
    simulated: bool = True
    recommendation: str = 'Inspect both sides of affected leaves. Avoid overhead watering, disinfect tools and consult a local agricultural expert before treatment. Follow the registered product label; do not infer a dose from this sample report.'