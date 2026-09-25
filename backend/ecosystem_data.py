FIELDS = [
    {'id': 'field-01', 'name': 'Field 01', 'crop': 'Wheat', 'area_acres': 4.2, 'boundary': [[100, 120], [110, 500], [410, 480], [390, 140]], 'health': [68, 76, 82], 'ndvi': [0.58, 0.67, 0.76], 'stress': ['Medium', 'Low', 'Low'], 'risk': ['Medium', 'Medium', 'Medium']},
    {'id': 'field-02', 'name': 'Field 02', 'crop': 'Maize', 'area_acres': 2.6, 'boundary': [[430, 135], [450, 480], [700, 465], [690, 145]], 'health': [80, 73, 61], 'ndvi': [0.73, 0.63, 0.48], 'stress': ['Low', 'Medium', 'High'], 'risk': ['Low', 'Medium', 'High']},
    {'id': 'field-03', 'name': 'Field 03', 'crop': 'Mustard', 'area_acres': 3.1, 'boundary': [[150, 530], [180, 850], [650, 840], [620, 525]], 'health': [75, 81, 89], 'ndvi': [0.65, 0.74, 0.83], 'stress': ['Medium', 'Low', 'Low'], 'risk': ['Medium', 'Low', 'Low']},
]
OFFERS = [
    {'id': 'soil-partners', 'name': 'Soil Futures Collective', 'country': 'India', 'flag': '🇮🇳', 'rate': 900, 'focus': 'Soil regeneration', 'minimum': 0.1},
    {'id': 'regen-alliance', 'name': 'Regeneration Alliance', 'country': 'Brazil', 'flag': '🇧🇷', 'rate': 1100, 'focus': 'Cover crops & biodiversity', 'minimum': 0.1},
    {'id': 'water-collective', 'name': 'Water Stewardship Circle', 'country': 'South Africa', 'flag': '🇿🇦', 'rate': 1000, 'focus': 'Water-smart farming', 'minimum': 0.1},
]
FACTORS = {'water-saving': 0.08, 'compost': 0.12, 'cover-crop': 0.15, 'residue-retention': 0.1, 'no-till': 0.14, 'agroforestry': 0.2}

def analytics_data(season):
    water = [3400, 3000, 2700, 2400, 2200, 1900, 1600, 1200]
    fertilizer = [9, 8, 7, 6, 5, 4, 2, 1]
    health = [68, 70, 73, 77, 80, 82, 84, 86]
    if season == 'previous':
        water = [3700, 3500, 3400, 3200, 3000, 2800, 2600, 2200]
        fertilizer = [10, 9, 8, 7, 6, 5, 4, 3]
        health = [63, 65, 69, 70, 73, 75, 76, 78]
    return {'sample': True, 'season': season, 'water_used': sum(water), 'fertilizer_used': sum(fertilizer), 'crop_health': health[-1], 'estimated_yield': 2.8 if season == 'current' else 2.4, 'series': [{'week': f'W{i+1}', 'water': w, 'fertilizer': f, 'health': h} for i, (w, f, h) in enumerate(zip(water, fertilizer, health))]}

def recommendation(v):
    dry_threshold = 25 + (5 if v.soil == 'Sandy' else 0) + (5 if v.stage == 'Flowering' else 0) + (5 if v.crop == 'Rice' else 0)
    if v.moisture >= 75:
        action, title, hi, saving = 'wait', 'Avoid irrigation. Check drainage.', 'सिंचाई रोकें। जल निकासी जाँचें।', 20
    elif v.moisture < dry_threshold:
        action, title, hi, saving = 'inspect', 'Soil is dry. Check the root zone today.', 'मिट्टी सूखी है। आज जड़ों की नमी जाँचें।', 0
    elif v.rain_probability >= 60:
        action, title, hi, saving = 'wait', 'Do not irrigate today.', 'आज सिंचाई न करें।', 25
    elif v.previous_activity == 'Irrigated recently':
        action, title, hi, saving = 'wait', 'Let the recent irrigation settle.', 'पिछली सिंचाई के बाद नमी जाँचें।', 15
    elif v.moisture < 40:
        action, title, hi, saving = 'inspect', 'Inspect soil before light irrigation.', 'हल्की सिंचाई से पहले मिट्टी जाँचें।', 10
    else:
        action, title, hi, saving = 'monitor', 'Moisture is adequate. Monitor tomorrow.', 'नमी पर्याप्त है। कल फिर जाँचें।', 15
    en = f'{title} Confirm the local forecast and check soil near the roots before acting. This is a rule-based example, not a live forecast.'
    hindi = f'{hi} निर्णय से पहले स्थानीय मौसम और जड़ों के पास मिट्टी की नमी की पुष्टि करें। यह नियम-आधारित उदाहरण है, लाइव पूर्वानुमान नहीं।'
    reasons = [f'Soil moisture: {v.moisture}% · {v.soil} soil', f'Example rain probability: {v.rain_probability}%', f'{v.crop} is at the {v.stage.lower()} stage in {v.location}.', f'Illustrative field health: {v.crop_health}% — ' + ('inspect stressed patches.' if v.crop_health < 65 else 'continue regular scouting.'), f'Previous activity: {v.previous_activity}.']
    hindi_reasons = [f'मिट्टी की नमी: {v.moisture}% · {v.soil}', f'बारिश की नमूना संभावना: {v.rain_probability}%', f'{v.location} में {v.crop}, अवस्था: {v.stage}।', f'नमूना फसल स्वास्थ्य: {v.crop_health}%। ' + ('कमज़ोर पौधों की जाँच करें।' if v.crop_health < 65 else 'नियमित निरीक्षण जारी रखें।'), f'पिछली गतिविधि: {v.previous_activity}।']
    return dict(action=action, title=title, title_hi=hi, recommendation=en, recommendation_hi=hindi, saving_percent=saving, reasons=reasons, reasons_hi=hindi_reasons, inputs=v)