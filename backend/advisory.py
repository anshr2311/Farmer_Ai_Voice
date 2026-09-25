def make_advice(question, language):
    q = question.lower()
    if any(term in q for term in ('yellow', 'पीले', 'पीला', 'peele', 'peela', 'पिवळ', 'ਪੀਲੇ')):
        return {
            'hi': 'पीले पत्तों के कई संभावित कारण हैं: पोषक तत्वों की कमी, अधिक पानी, जड़ों में समस्या या कीट। 1. देखें कि पुराने या नए पत्ते पहले पीले हुए। 2. जड़ों के पास नमी और जल निकासी जाँचें। 3. पत्ती के नीचे कीट देखें। 4. मिट्टी की जाँच करवाएँ और स्थानीय कृषि विशेषज्ञ से पुष्टि करें। बिना पहचान के खाद या दवा की मात्रा न बढ़ाएँ। यह नमूना मार्गदर्शन है, निश्चित निदान नहीं।',
            'en': 'Yellow leaves can have several causes: nutrient deficiency, excess water, root problems or pests. 1. Check whether older or younger leaves yellowed first. 2. Inspect root-zone moisture and drainage. 3. Look for pests beneath the leaves. 4. Arrange a soil test and confirm with a local agricultural expert. Do not increase fertilizer or pesticide doses without identifying the cause. This is sample guidance, not a diagnosis.',
            'mr': 'पिवळ्या पानांची कारणे अन्नद्रव्यांची कमतरता, जास्त पाणी किंवा कीड असू शकतात. जुनी की नवी पाने आधी पिवळी झाली ते तपासा. मुळांजवळ ओलावा आणि निचरा तपासा. माती परीक्षण आणि स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या. हे नमुना मार्गदर्शन आहे, निदान नाही.',
            'pa': 'ਪੀਲੇ ਪੱਤਿਆਂ ਦਾ ਕਾਰਨ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਘਾਟ, ਵੱਧ ਪਾਣੀ ਜਾਂ ਕੀੜੇ ਹੋ ਸਕਦੇ ਹਨ। ਪੁਰਾਣੇ ਅਤੇ ਨਵੇਂ ਪੱਤੇ, ਜੜ੍ਹਾਂ ਕੋਲ ਨਮੀ ਅਤੇ ਨਿਕਾਸੀ ਜਾਂਚੋ। ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਅਤੇ ਸਥਾਨਕ ਖੇਤੀ ਮਾਹਰ ਤੋਂ ਸਲਾਹ ਲਓ। ਇਹ ਨਮੂਨਾ ਸਲਾਹ ਹੈ, ਪੱਕਾ ਨਿਦਾਨ ਨਹੀਂ।'
        }[language]
    if any(s in q for s in ('भाव', 'price', 'mandi', 'rate', 'कीमत', 'दर')):
        hi = 'उदाहरण मंडी भाव: बरेली में गेहूँ ₹2,425 और लखनऊ में टमाटर ₹1,850 प्रति क्विंटल। ये नमूना दरें हैं, आज के वास्तविक भाव नहीं। बिक्री से पहले स्थानीय मंडी या AGMARKNET पर दर की पुष्टि करें।'
        en = 'Sample mandi prices: wheat in Bareilly is ₹2,425 and tomato in Lucknow is ₹1,850 per quintal. These are illustrative, not today’s live prices. Verify with your local mandi or AGMARKNET before selling.'
        mr = 'नमुना बाजारभाव: बरेलीमध्ये गहू ₹2,425 आणि लखनऊमध्ये टोमॅटो ₹1,850 प्रति क्विंटल. हे प्रत्यक्ष आजचे भाव नाहीत. विक्रीपूर्वी स्थानिक बाजारात दर तपासा.'
        pa = 'ਨਮੂਨਾ ਮੰਡੀ ਭਾਅ: ਬਰੇਲੀ ਵਿੱਚ ਕਣਕ ₹2,425 ਅਤੇ ਲਖਨਊ ਵਿੱਚ ਟਮਾਟਰ ₹1,850 ਪ੍ਰਤੀ ਕੁਇੰਟਲ। ਇਹ ਅੱਜ ਦੇ ਅਸਲ ਭਾਅ ਨਹੀਂ ਹਨ। ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਸਥਾਨਕ ਮੰਡੀ ਵਿੱਚ ਪੁਸ਼ਟੀ ਕਰੋ।'
    elif any(s in q for s in ('rain', 'weather', 'मौसम', 'बारिश', 'पाऊस')):
        hi = 'मौसम संबंधी सामान्य सलाह: बारिश से पहले खेत की जल निकासी जाँचें और कटी हुई फसल को ढककर रखें। तेज हवा या बारिश में छिड़काव न करें। यह लाइव पूर्वानुमान नहीं है; स्थानीय IMD पूर्वानुमान देखकर सिंचाई तय करें।'
        en = 'General weather advice: check field drainage and cover harvested crops before rain. Avoid spraying in wind or rain. This is not a live forecast; use the local IMD forecast before scheduling irrigation.'
        mr = 'पावसापूर्वी शेतातील निचरा तपासा आणि कापणी केलेले पीक झाकून ठेवा. वारा किंवा पावसात फवारणी करू नका. हा थेट हवामान अंदाज नाही; स्थानिक IMD अंदाज तपासा.'
        pa = 'ਮੀਂਹ ਤੋਂ ਪਹਿਲਾਂ ਖੇਤ ਦੀ ਨਿਕਾਸੀ ਜਾਂਚੋ ਅਤੇ ਕੱਟੀ ਫ਼ਸਲ ਢੱਕ ਕੇ ਰੱਖੋ। ਹਵਾ ਜਾਂ ਮੀਂਹ ਵਿੱਚ ਛਿੜਕਾਅ ਨਾ ਕਰੋ। ਇਹ ਲਾਈਵ ਅਨੁਮਾਨ ਨਹੀਂ; ਸਥਾਨਕ ਮੌਸਮ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।'
    elif any(s in q for s in ('इल्ली', 'कीट', 'pest', 'worm', 'disease', 'रोग', 'पत्ती')):
        hi = 'फसल की प्रभावित पत्तियों और पौधों का निरीक्षण करें। कीट की पहचान और प्रकोप की सीमा की पुष्टि स्थानीय कृषि विशेषज्ञ से कराएँ। किसी भी दवा का चयन और प्रति एकड़ मात्रा केवल पंजीकृत लेबल के अनुसार करें। दस्ताने पहनें और तेज हवा में छिड़काव न करें। सलाह के लिए किसान कॉल सेंटर: 1800-180-1551।'
        en = 'Inspect affected leaves and plants. Ask a local agricultural expert to confirm the pest and infestation level. Select a registered product and per-acre dose only from its approved crop-specific label. Wear gloves and avoid spraying in windy weather. Kisan Call Centre: 1800-180-1551.'
        mr = 'बाधित पाने आणि रोपांची तपासणी करा. स्थानिक कृषी तज्ज्ञाकडून किडीची खात्री करा. औषधाची निवड आणि प्रति एकर मात्रा नोंदणीकृत लेबलानुसारच ठरवा. हातमोजे वापरा. किसान कॉल सेंटर: 1800-180-1551.'
        pa = 'ਪ੍ਰਭਾਵਿਤ ਪੱਤਿਆਂ ਅਤੇ ਬੂਟਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ। ਸਥਾਨਕ ਖੇਤੀ ਮਾਹਰ ਤੋਂ ਕੀੜੇ ਦੀ ਪਛਾਣ ਕਰਵਾਓ। ਦਵਾਈ ਅਤੇ ਪ੍ਰਤੀ ਏਕੜ ਖੁਰਾਕ ਸਿਰਫ਼ ਮਨਜ਼ੂਰ ਲੇਬਲ ਅਨੁਸਾਰ ਵਰਤੋ। ਦਸਤਾਨੇ ਪਾਓ। ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ: 1800-180-1551।'
    else:
        hi = 'यह सीमित नमूना सलाह है। बेहतर मार्गदर्शन के लिए अपनी फसल, गाँव और समस्या बताकर कृषि विशेषज्ञ से बात करें। मिट्टी की जाँच के अनुसार खाद दें और जलभराव से बचें। आप मंडी भाव, मौसम या फसल के कीटों पर नमूना प्रश्न पूछ सकते हैं। किसान कॉल सेंटर: 1800-180-1551।'
        en = 'This is limited sample guidance. For crop-specific advice, tell a local expert your crop, village and symptoms. Base fertilizer use on a soil test and avoid waterlogging. You can try sample questions about mandi prices, weather or pests. Kisan Call Centre: 1800-180-1551.'
        mr = 'हे मर्यादित नमुना मार्गदर्शन आहे. योग्य सल्ल्यासाठी तज्ज्ञांना तुमचे पीक, गाव आणि समस्या सांगा. माती परीक्षणानुसार खत द्या आणि पाणी साचू देऊ नका. किसान कॉल सेंटर: 1800-180-1551.'
        pa = 'ਇਹ ਸੀਮਤ ਨਮੂਨਾ ਸਲਾਹ ਹੈ। ਸਹੀ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਮਾਹਰ ਨੂੰ ਫ਼ਸਲ, ਪਿੰਡ ਅਤੇ ਸਮੱਸਿਆ ਦੱਸੋ। ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਅਨੁਸਾਰ ਖਾਦ ਪਾਓ। ਕਿਸਾਨ ਕਾਲ ਸੈਂਟਰ: 1800-180-1551।'
    return {'hi': hi, 'en': en, 'mr': mr, 'pa': pa}[language]