(()=>{
"use strict";
const pageKind=location.pathname.includes("/review")?"review":"customer";
const STRINGS=pageKind==="review"?{"و":"W","قاعة لاني — فندق أرين المطار · جدة":"Lany Hall · Areen Airport Hotel · Jeddah","عرض الفكرة للإدارة — نموذج غير رسمي":"Management concept review — unofficial prototype","تجربة العميل ←":"← Customer experience","للمناقشة والتحقق — وليس نظام إدارة":"For discussion and validation — not a management system","هل تناسب الفكرة طريقة عمل لاني؟":"Does this concept fit how Lany Hall operates?","التجربة الحالية توضح رغبة العميل قبل التواصل. هذا العرض يساعدكم في تحديد ما إذا كان لها دور فعلي في عمل القاعة، وما الذي لا يعكس الواقع.":"The current experience clarifies customer preferences before contact. Use this review to determine whether it is relevant to the venue and where it does not reflect reality.","العميل":"Customer","يحدد ما يريده":"Describes their wishes","النموذج":"Prototype","ينظم رغبته في تصور وملخص واضح":"Organizes preferences into a visual concept and clear brief","لاني":"Lany Hall","تراجع ما يمكن توفيره وتنفيذه فعلياً":"Reviews what can actually be provided and delivered","لا يتحقق النموذج من السعة أو التوفر أو الخيارات الفعلية أو الأسعار أو قابلية التنفيذ. لا يرسل بيانات إلى القاعة.":"The prototype does not verify capacity, availability, actual options, pricing or feasibility. It does not send data to the venue.","تجربة العميل الأساسية لم تتغير. يُفضّل عرضها أولاً ثم مناقشة هذه الأسئلة.":"The existing customer journey is unchanged. We recommend showing it first, then discussing these questions.","افتح تجربة العميل ↗":"Open customer experience ↗","تحقق إداري · إجابات محلية فقط":"Management validation · Local responses only","ما الذي نحتاج تأكيده منكم؟":"What do we need to confirm with you?","ثلاث مجموعات قصيرة. يمكن تعديل الإجابات في أي وقت، ولن تُحفظ أو تُرسل تلقائياً.":"Three short groups. Responses can be edited at any time and are not stored or sent automatically.","١ — الفائدة ذات الصلة":"1 — Relevance","نبدأ بما قد يكون مناسباً، وليس بمدى جمال العرض.":"Start with potential relevance, not how attractive the demo looks.","١. هل ترون فائدة في أن يصل العميل بهذه الصورة المنظمة قبل مناقشة التفاصيل الفعلية؟":"1. Would it help if customers brought this organized summary before discussing actual arrangements?","نعم":"Yes","جزئياً":"Partly","لا":"No","٢. أي جزء من التجربة أقرب لواقع عملكم؟":"2. Which part is closest to your actual process?","توضيح رغبة العميل":"Clarifying customer wishes","الإلهام البصري":"Visual inspiration","اختيار الاتجاه":"Choosing a direction","ملخص المراجعة":"Review summary","لا شيء مما سبق":"None of these","٢ — ملاءمة الواقع":"2 — Operational fit","المطلوب تصحيح افتراضاتنا، حتى لو كانت الإجابات سلبية.":"Please correct our assumptions, even if your answers are negative.","٣. أي جزء لا يعكس طريقة عملكم الحالية؟":"3. Which part does not reflect how you currently work?","كيف تصفون مدى ملاءمة المسار المقترح؟":"How well does the proposed journey fit your process?","يتوافق مع عملنا":"Matches our process","يتوافق جزئياً":"Partly matches","لا يتوافق":"Does not match","لا يمكن الحكم حالياً":"Cannot assess yet","ما الذي لا يطابق الواقع؟":"What does not match reality?","٤. ما المعلومات التي يحتاجها فريقكم عادةً قبل مناقشة التفاصيل مع العميل؟":"4. What information does your team usually need before discussing details with customers?","٥. هل الخيارات البصرية لديكم قابلة للتوحيد جزئياً، أم أن كل مناسبة تُعالج بشكل مختلف؟":"5. Can parts of your visual offerings be standardized, or is each event handled differently?","يمكن توحيد جزء منها":"Some parts could be standardized","تختلف غالباً":"Usually different","تعتمد على الموردين":"Depends on suppliers","يحتاج توضيح":"Needs clarification","٣ — البيانات والجدوى التجارية":"3 — Data and commercial viability","الرغبة في متابعة النقاش لا تعني بعدُ استعداداً للدفع.":"Interest in further discussion does not mean willingness to pay.","٦. هل توجد بيانات يمكن مناقشة مشاركتها لبناء نموذج أدق عند الحاجة؟":"6. Could you discuss sharing data to develop a more accurate version if needed?","قد تشمل، حسب النطاق الذي تختارونه لاحقاً، مخطط القاعة أو الأبعاد أو الخيارات الفعلية أو سياسات السعة أو التسعير أو التوفر.":"Depending on later scope, this could involve floorplans, dimensions, real options, capacity policies, pricing or availability.","يمكن مناقشة بعض البيانات":"Some data could be discussed","يحتاج تحديد النطاق أولاً":"Scope needs to be defined first","لا تتوفر / لا يمكن مشاركتها حالياً":"Not available / cannot currently share","٧. إذا ثبت أن التجربة تناسب طريقة عملكم، هل ترون مبرراً لتطبيقها فعلياً للقاعة؟":"7. If this experience fits your process, would you see a reason to implement it for the venue?","نعم، نريد مناقشة التطبيق":"Yes, we want to discuss implementation","نحتاج تعديلات قبل الحكم":"We need changes before deciding","مفيدة لكن لا نحتاج تطبيقها":"Useful, but we do not need to implement it","لا نرى حاجة لها حالياً":"We do not currently need it","السابق":"Previous","التالي":"Next","حد الإثبات:":"Evidence threshold:","الإجابات هنا مسودة محلية فقط. تأكيد الجاهزية التجارية يتطلب محادثة حقيقية مع إدارة لاني ومناقشة نطاق التطبيق.":"These are local draft responses only. Commercial readiness requires a real conversation with Lany Hall management and discussion of implementation scope.","قراءة أولية من الإجابات المسجلة محلياً":"Preliminary reading of locally entered responses","ملخص الملاحظات":"Feedback summary","حالات التحقق — مؤشرات محلية فقط":"Validation states — local indicators only","بيانات محددة للنقاش إذا اختارت الإدارة المتابعة":"Potential data for discussion if management chooses to proceed","قائمة استرشادية غير مرسلة، يحدد نطاقها ما ذكرتم أنه مفيد.":"Unsent reference checklist, determined by the scope you find useful.","الحد التجاري":"Commercial boundary","DEMO_REACTION ليست PAID_VALIDATED. ولا تثبت هذه الواجهة وجود ميزانية أو موافقة أو نية دفع. OFFER_READY = NO إلى حين تحقق ذلك مع الإدارة فعلياً.":"A DEMO_REACTION is not PAID_VALIDATED. This interface proves no budget, approval or intent to pay. OFFER_READY = NO until verified with actual management.","الملاحظات لا تُرسل إلى لاني أو Digital Arhat ولا تُحفظ في CRM. هذا ملخص داخل المتصفح للمراجعة والنسخ اليدوي فقط.":"Feedback is not sent to Lany Hall or Digital Arhat, nor saved in a CRM. This is an in-browser summary for manual review and copying.","نسخ ملخص الملاحظات":"Copy feedback summary","تجربة تشخيصية غير رسمية خاصة بقاعة لاني — فندق أرين المطار — جدة. لا تمثل بوابة موظفين أو تكاملاً مع أنظمة القاعة. لا يتم حفظ أي رد خارج صفحة المتصفح.":"Unofficial diagnostic prototype for Lany Hall · Areen Airport Hotel, Jeddah. Not a staff portal or an integration with venue systems. No response is stored outside this browser page."}:{"و":"W","قاعة لاني — فندق أرين المطار":"Lany Hall · Areen Airport Hotel","جدة":"Jeddah","تصور بصري مبدئي · لاني":"A preliminary visual concept · Lany Hall","من الفكرة التي أعجبتك… إلى تصور أوضح لمناسبتك":"From an idea you love… to a clearer vision for your event","شارك ما ألهمك وحدد تفضيلات مناسبتك، لنرتبها في تصور مبدئي وطلب واضح يراجعه فريق القاعة.":"Share your inspiration and event preferences. We'll organize them into an initial concept and a clear brief for the venue team to review.","ابدأ تصور مناسبتك":"Start planning your event","لا حجز · لا سعر فوري · لا تأكيد توفر":"No booking · No instant pricing · No availability confirmation","هذا تصور مبدئي لتوضيح رغبتكم قبل مراجعة فريق القاعة. الخيارات والأسعار والتوفر والتنفيذ الفعلي تخضع لتأكيد القاعة.":"This initial concept helps explain your wishes before the venue team reviews them. Actual options, pricing, availability and execution must be confirmed by Lany Hall.","إلهامك":"Your inspiration","وسياق المناسبة":"And event context","اتجاه بصري":"Visual direction","وتفضيلات واضحة":"And clear preferences","ملخص منظم":"Organized brief","لمراجعة الفريق":"For team review","شاهد الفرق في لحظات":"See the idea in moments","ليست صوراً فقط… بل رغبة يمكن شرحها بوضوح":"More than photos… make your wishes easier to explain","اختر الطابع الذي يعبّر عن ذوقك. ستظهر معالجة بصرية توضيحية، ثم تفضيل واضح يمكن تضمينه في طلب المراجعة.":"Choose the mood that reflects your taste. See an illustrative visual treatment, then a clear preference you can include in your review request.","من الصورة المرجعية إلى اتجاه أوضح":"From a reference photo to a clearer direction","عرض توضيحي، وليس تجهيزاً":"Illustrative only, not an actual setup","صورة مرجعية حقيقية":"Authentic reference photo","اتجاه بصري مبدئي":"Initial visual direction","المعالجة تغيّر إحساس الصورة فقط؛ لا تضيف تجهيزات ولا تمثل خيارات متاحة أو تنفيذاً معتمداً لدى القاعة.":"The treatment only changes the photo's mood. It adds no furnishings and does not represent available options or an approved setup.","01 · تفضيل العميل":"01 · Customer preference","ما الطابع الأقرب لما تتخيله؟":"Which style best reflects your vision?","هادئ":"Calm","فاخر":"Luxurious","كلاسيكي":"Classic","عصري":"Modern","02 · ماذا يصبح أوضح للمراجعة؟":"02 · What becomes clearer for review?","موجز تفضيل قابل للمناقشة":"Preference summary for discussion","الطابع الذي اختاره العميل:":"Customer's chosen style:","لم يُحدد بعد":"Not selected yet","جرّب اختيار طابع لرؤية كيف تتحول رغبتك إلى معلومة منظّمة.":"Choose a style to see how your preference becomes a structured detail.","استكمل تصور مناسبتك":"Continue planning your event","03 · المراجعة البشرية تبقى لدى فريق لاني":"03 · Human review remains with Lany Hall","لا حجز · لا سعر · لا تحقق من التوفر":"No booking · No price · No availability check","تجربة أولية للتخطيط":"Initial planning experience","وضّح فكرتك قبل مراجعتها مع القاعة":"Clarify your idea before the venue reviews it","المدخلات التالية تعبّر عن رغبتك أنت. لا تتحقق هذه التجربة من السعة أو التوفر أو الأسعار أو قابلية التنفيذ.":"These inputs describe your preferences only. This experience does not check capacity, availability, prices or feasibility.","الفئات والأساليب هنا لتوصيف نية العميل فقط، وليست قائمة خدمات أو تجهيزات مؤكدة للقاعة.":"These categories and styles describe customer intent. They are not a confirmed list of venue services or furnishings.","مدخلات العميل":"Customer input","ما الذي تتخيله لمناسبتك؟":"What are you imagining for your event?","نوع المناسبة":"Event type","نية العميل":"Customer intent","زفاف":"Wedding","ملكة":"Marriage ceremony","مناسبة عائلية":"Family event","أخرى":"Other","التاريخ المفضل":"Preferred date","للمراجعة فقط":"For review only","عدد الضيوف المتوقع":"Estimated guest count","معلومة من العميل فقط":"Customer-supplied information only","شارك صورة أو فكرة ألهمتك":"Share an image or idea that inspired you","مرجع بصري":"Visual reference","لم تتم إضافة مرجع بعد":"No reference added yet","الصورة مرجع للإلهام وليست وعداً بإعادة تنفيذها.":"The photo is for inspiration, not a promise of exact reproduction.","إضافة مرجع":"Add reference","الطابع المفضل":"Preferred style","اتجاه بصري، وليس مخزوناً":"Visual direction, not inventory","صورة حقيقية من لاني":"Authentic Lany Hall photograph","اختر طابعاً لتوضيح الاتجاه الذي تميل إليه":"Choose a style to describe your preferred direction","التغيير البصري هنا استرشادي فقط، ولا يمثل ديكوراً أو تجهيزاً متوفراً لدى القاعة.":"This visual treatment is illustrative only; it does not represent décor or equipment available at the venue.","من الإلهام إلى لغة بصرية أوضح":"From inspiration to a clearer visual language","ماذا أعجبك في هذا الإلهام؟":"What do you like about this inspiration?","حدّد ما تريد الاحتفاظ به من الفكرة. هذه تفضيلاتك أنت وليست قائمة تجهيزات أو خيارات متاحة لدى القاعة.":"Choose what you want to keep from the idea. These are your preferences, not a list of available venue furnishings or options.","مرجعك البصري":"Your visual reference","نستخدمه لفهم الاتجاه الذي تريد وصفه، وليس كوعد بإعادة تنفيذ الصورة.":"We use it to understand what you wish to describe, not to promise reproduction of the image.","قراءة بصرية استرشادية للصورة":"Illustrative color reading of the image","أضف صورة لقراءة ألوانها المرجعية":"Add an image to sample its reference colors","لا توجد قراءة لونية بعد":"No color reading yet","استخدام الألوان المحددة كمرجع":"Use selected colors as a reference","القراءة الآلية هنا تقتصر على أخذ عينات لونية من الصورة داخل المتصفح. الأجواء والإضاءة ودرجة التفاصيل يحددها العميل بنفسه.":"Automatic reading only samples colors from the image in your browser. You choose the mood, lighting and detail level yourself.","صف الاتجاه الذي تريده":"Describe your desired direction","تفضيلات قابلة للتعديل":"Editable preferences","الأجواء":"Atmosphere","اختر وصفاً واحداً":"Choose one description","هادئة":"Calm","فاخرة":"Luxurious","دافئة":"Warm","رسمية":"Formal","عصرية":"Modern","كلاسيكية":"Classic","الألوان":"Colors","تفضيل بصري":"Visual preference","فاتح ومحايد":"Light and neutral","أبيض وذهبي":"White and gold","دافئ":"Warm tones","أخضر هادئ":"Soft green","ألوان داكنة":"Dark tones","ألوان مخصصة":"Custom colors","كثافة التفاصيل":"Detail level","تفضيل بصري فقط":"Visual preference only","بسيط":"Minimal","متوازن":"Balanced","غني بالتفاصيل":"Rich in detail","الإضاءة":"Lighting","ناعمة":"Soft","درامية":"Dramatic","مشرقة":"Bright","ما الذي تريد الاحتفاظ به من هذه الفكرة؟":"What would you like to keep from this idea?","يمكن اختيار أكثر من عنصر":"You can choose more than one element","الكوشة / منطقة العروس":"Bridal stage / bridal area","الممر":"Aisle","الطاولات":"Tables","الجو العام":"Overall atmosphere","ملاحظات الإلهام":"Inspiration notes","صحّح أو أضف ما يهمك":"Correct or add what matters to you","القاعة المرجعية":"Reference venue","مرجع بصري فقط":"Visual reference only","الاتجاه المقترح للفكرة":"Proposed mood direction","معالجة لونية ومزاجية فقط — لا تغيّر هندسة القاعة أو تجهيزاتها.":"Color and mood treatment only — no changes to venue layout or furnishings.","اختر تفضيلاتك ليتكوّن وصف بصري أوضح للفكرة.":"Choose preferences to build a clearer visual description of your idea.","المعالجة البصرية استرشادية لتوضيح التفضيلات ولا تمثل تجهيزاً متاحاً أو اعتماداً تنفيذياً.":"The visual treatment illustrates preferences and is not an available setup or execution approval.","من التفضيلات إلى قرار أوضح":"From preferences to a clearer decision","أي اتجاه أقرب لما تريد أن يراجعه فريق لاني؟":"Which direction is closest to what you want Lany Hall to review?","الاتجاهات التالية تفسيرات بصرية لتفضيلاتك أنت. لا تمثل باقات أو تجهيزات أو خيارات متاحة لدى القاعة.":"These directions are visual interpretations of your preferences. They are not packages, inventory or available configurations.","قارن اتجاهاتك":"Compare your directions","أكمل الأجواء والألوان والإضاءة والتفاصيل وأولوية بصرية واحدة.":"Complete atmosphere, colors, lighting, detail level and at least one visual priority.","ثلاث قراءات لنفس تفضيلاتك":"Three interpretations of your preferences","الاختلاف في التركيز البصري فقط":"Only the visual emphasis changes","ما الذي تريد الاحتفاظ به من هذا الاتجاه؟":"What do you want to keep from this direction?","تظهر هنا فقط عناصر مرتبطة بما أكدته أنت سابقاً.":"Only elements related to your earlier confirmed preferences appear here.","ما الذي جعل هذا الاتجاه أقرب لك؟":"What made this direction feel closer to your vision?","اختياري":"Optional","اختر اتجاهاً مفضلاً لتظهر خلاصة القرار هنا.":"Choose a preferred direction to see your decision summary.","هل لديك تفضيلات خاصة بالضيافة؟":"Any special hospitality preferences?","ملاحظة للمراجعة":"Note for review","هل ترغب في معاينة القاعة؟":"Would you like to visit the venue?","رغبة فقط، وليست حجز موعد":"Interest only, not an appointment booking","نعم":"Yes","ليس الآن":"Not now","أناقشها مع الفريق":"Discuss with the team","ملاحظات أو تفاصيل مهمة":"Important notes or details","نص حر":"Free text","لا تقوم هذه الواجهة بتأكيد السعة أو التوفر أو السعر أو التنفيذ، ولا ترسل البيانات تلقائياً إلى أنظمة قاعة لاني — فندق أرين المطار.":"This interface does not confirm capacity, availability, price or execution and does not automatically send data to Lany Hall systems.","أصبحت تفضيلاتك واتجاهك المفضل جاهزين للعرض في ملخص واحد، مع فصل ما يحتاج إلى تأكيد القاعة.":"Your preferences and preferred direction are ready to view in a single summary, with venue confirmation items kept separate.","راجع ملخص مناسبتك":"Review your event brief","ملخص مناسبتك للمراجعة":"Your event brief for review","لم يحدد بعد":"Not specified yet","الإلهام":"Inspiration","لم يضف مرجع بعد":"No reference added yet","اهتمامات الضيافة":"Hospitality preferences","لا توجد ملاحظة بعد":"No note yet","رغبة المعاينة":"Venue visit interest","لم تحدد بعد":"Not specified yet","ملاحظات إضافية":"Additional notes","لا توجد ملاحظات بعد":"No additional notes yet","الاتجاه البصري":"Visual direction","تفضيلات العميل وقراءة لونية استرشادية — وليست التزاماً من القاعة.":"Customer preferences and illustrative color reading — not a venue commitment.","مصدر الإلهام":"Inspiration source","الأجواء المطلوبة":"Desired atmosphere","الألوان المفضلة":"Preferred colors","ألوان مرجعية من الصورة":"Reference colors from image","بانتظار تأكيد العميل":"Awaiting customer confirmation","الإضاءة المفضلة":"Preferred lighting","درجة التفاصيل":"Detail level","العناصر الأكثر أهمية":"Most important elements","قرار الاتجاه":"Direction decision","قرار تفضيل من العميل — وليس اعتماداً تشغيلياً من القاعة.":"A customer preference decision, not venue approval.","الاتجاه المفضل":"Preferred direction","سبب الاختيار":"Reason for selection","بانتظار اختيار العميل":"Awaiting customer selection","العناصر التي يريد الاحتفاظ بها":"Elements to keep","اتجاه بديل":"Alternative direction","لا يوجد اختيار بديل":"No alternative selected","ملاحظات المقارنة":"Comparison notes","خلاصة القرار":"Decision summary","بانتظار اختيار الاتجاه":"Awaiting direction selection","هذا هو الاتجاه الذي تريد أن يراجعه فريق لاني":"This is the direction you want Lany Hall to review","هذا تصور مبدئي للتعبير عن التفضيلات، ولا يمثل سعراً أو توفراً أو تجهيزاً معتمداً أو ضماناً للتنفيذ.":"This preliminary concept expresses your preferences; it is not a price, availability confirmation, approved setup or guarantee of execution.","جاهز للمراجعة مع فريق لاني":"Ready for review with the Lany Hall team","هذا يعني أن رغبة العميل أصبحت منظمة للمناقشة فقط؛ لا يعني اعتماداً أو سعراً أو توفراً أو قابلية تنفيذ.":"Your wishes have been organized for discussion only. This does not mean approval, pricing, availability or feasibility.","تواصل مع فريق القاعة":"Contact the venue team","المسار العام المتحقق:":"Verified public contact:","مسار واتساب قاعة لاني منشور ضمن روابط مجموعة فنادق أرين؛ لا إرسال تلقائي.":"No WhatsApp route is assumed here.","ملخص التفضيلات قبل التواصل":"Preference summary before contact","راجع ما اخترته قبل مشاركته مع فريق لاني. هذه معلوماتك وتفضيلاتك، وليست موافقة من القاعة.":"Review your selections before sharing them with Lany Hall. These are your details and preferences, not venue approval.","الاتجاه البصري المختار للمراجعة":"Selected visual direction for review","تصور استرشادي للتفضيلات — وليس تجهيزاً معتمداً أو ضماناً للتنفيذ.":"Illustrative concept only — not an approved setup or execution guarantee.","خلاصة رغبتك":"Summary of your wishes","التوفر والسعة والتجهيزات والأسعار والتنفيذ الفعلي تحتاج مراجعة فريق لاني.":"Availability, capacity, furnishings, pricing and actual execution require review by the Lany Hall team.","نقاط للمراجعة مع فريق القاعة · ملخص مقترح للمراجعة":"Points for discussion with the venue team · Suggested review checklist","ما حددته للمناسبة":"What you specified for the event","حددها العميل":"Customer-confirmed","تظهر هنا المعلومات التي أدخلتها أو اخترتها فقط.":"Only details you entered or selected are shown here.","ما يحتاج تأكيد فريق لاني":"What Lany Hall needs to confirm","يحتاج تأكيد القاعة":"Requires venue confirmation","هذه مسائل لم تتحقق منها التجربة، وليست وصفاً لإجراءات داخلية لدى القاعة.":"These are matters this experience cannot verify, not a description of the venue's internal procedures.","التاريخ":"Date","يحتاج تأكيد التوفر من فريق القاعة.":"Availability needs confirmation from the venue.","عدد الضيوف":"Guest count","يحتاج مراجعة السعة المناسبة من فريق القاعة.":"Suitable capacity needs review by the venue.","تحتاج الخيارات الفعلية وقابلية التنفيذ إلى مراجعة القاعة.":"Actual options and feasibility require venue review.","التجهيزات والإضاءة":"Equipment and lighting","تُحدد بعد مراجعة ما هو متاح فعلياً.":"To be determined after review of actual availability.","الضيافة":"Hospitality","تحتاج مراجعة الخيارات الفعلية مع فريق القاعة.":"Actual options require venue team review.","السعر":"Price","لم يحدده النموذج؛ يحتاج مراجعة تفاصيل المناسبة مع القاعة.":"Not determined by this concept; discuss your event details with the venue.","هذا هو ملخص رغبتك للمناقشة مع القاعة":"This is a summary of your wishes for discussion with the venue","هذه المعلومات تعبّر عن رغبتي":"These details reflect my preferences","تأكيدك هنا يخص المعلومات التي أدخلتها فقط، ولا يعني حجزاً أو موافقة من القاعة.":"Your confirmation covers only the information you entered, not a booking or venue approval.","تواصل مع فريق لاني":"Contact the Lany Hall team","نسخ ملخص الطلب":"Copy request brief","تعديل التفاصيل":"Edit details","مسار التواصل المنشور للقاعة:":"The phone link uses the verified public number:",". لا يتم إرسال الطلب تلقائياً، ويمكنك نسخ الملخص لمشاركته بالطريقة التي تختارها.":". Nothing is sent automatically. You can copy the brief and share it however you choose."};
const ATTRS=pageKind==="review"?{"حدود الفكرة":"Concept boundaries","اشرحوا الفرق إن وجد، دون افتراض إجراءات معينة…":"Explain any differences without assuming specific procedures…","اكتبوا المعلومات الفعلية المستخدمة لديكم…":"Describe the actual information your team uses…"}:{"كيف تعمل الفكرة":"How the concept works","المقارنة التوضيحية باستخدام صورة حقيقية للوردة البيضاء":"Illustrative comparison using an authentic Lany Hall photo","صورة مرجعية من قاعة لاني — فندق أرين المطار":"Reference photo from Lany Hall · Areen Airport Hotel","معالجة لونية استرشادية للصورة نفسها":"Illustrative color treatment of the same photo","اختر طابعاً بصرياً توضيحياً":"Choose an illustrative visual style","التاريخ المفضل":"Preferred date","مثال: 300":"Example: 300","عدد الضيوف المتوقع":"Estimated guest count","مرجع بصري أضافه العميل":"Customer-added visual reference","صف الألوان التي تريدها…":"Describe your preferred colors…","مثلاً: أحب هدوء الألوان أكثر من كثافة التفاصيل…":"For example: I prefer calmer colors rather than intricate details…","مقارنة مرجعية لاتجاه الفكرة":"Reference comparison for conceptual direction","اكتب ملاحظة قصيرة إن رغبت…":"Add a short note, if you wish…","اكتب ما يهمك أو اتركها فارغة…":"Write what matters to you, or leave blank…","أي تفاصيل تريد من الفريق معرفتها عند المراجعة…":"Any details you would like the team to know during review…","حدود مراجعة القاعة":"Scope of venue review"};
const STORAGE_KEY="whiteRoseInterfaceLanguage";
const chosen=new URLSearchParams(location.search).get("lang");
let lang=chosen==="en"||chosen==="ar"?chosen:(localStorage.getItem(STORAGE_KEY)==="en"?"en":"ar");
const saved=new WeakMap(),savedAttributes=new WeakMap();
const arabic=/[\u0600-\u06FF]/,digits=/[٠-٩۰-۹]/g;
const numerals={"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"};
const termMap={
 "زفاف":"Wedding","ملكة":"Marriage ceremony","مناسبة عائلية":"Family event","أخرى":"Other",
 "هادئ":"Calm","هادئة":"Calm","فاخر":"Luxurious","فاخرة":"Luxurious","كلاسيكي":"Classic","كلاسيكية":"Classic",
 "عصري":"Modern","عصرية":"Modern","دافئة":"Warm","دافئ":"Warm","رسمية":"Formal",
 "ناعمة":"Soft","درامية":"Dramatic","مشرقة":"Bright","متوازن":"Balanced","بسيط":"Minimal","غني بالتفاصيل":"Rich in detail",
 "فاتح ومحايد":"Light and neutral","أبيض وذهبي":"White and gold","أخضر هادئ":"Soft green",
 "ألوان داكنة":"Dark tones","ألوان مخصصة":"Custom colors","الأجواء":"Atmosphere","الألوان":"Colors",
 "الإضاءة":"Lighting","درجة التفاصيل":"Detail level","الممر":"Aisle","الكوشة / منطقة العروس":"Bridal stage / bridal area",
 "الطاولات":"Tables","الجو العام":"Overall atmosphere","منطقة العروس":"Bridal area",
 "لا":"No","نعم":"Yes","جزئياً":"Partly","لم يحدد بعد":"Not specified yet",
 "لم يُحدد بعد":"Not selected yet","لم تحدد بعد":"Not specified yet","لا يوجد":"None",
 "اختيار أسلوب من العميل":"Customer-selected style","مرجع بصري مرفوع من العميل":"Customer-uploaded visual reference",
 "التركيز على الممر":"Emphasis on aisle","التركيز على منطقة العروس":"Emphasis on bridal area",
 "التركيز على الألوان":"Emphasis on colors","الجو العام":"Overall mood","ألوان الصورة":"Image colors",
 "الاتجاه الأول":"Direction 1","الاتجاه الثاني":"Direction 2","الاتجاه الثالث":"Direction 3",
 "إلهام العميل":"Customer inspiration","النص":"Text"
};
const dynamicMap={
 "إضاءة":"Lighting",
 "التفاصيل":"Details",
 "التاريخ المفضل":"Preferred date",
 "عرض التقييم":"View assessment",
 "غير متحقق داخل هذه الواجهة":"Not verified in this interface",
 "غير مؤكد":"Not confirmed",
 "لم تُناقش تجارياً":"Not commercially discussed",
 "إشارة من إجابة محلية":"Indicated in a local response only",
 "أُشير لإمكانية النقاش":"Data discussion appears possible (local response)",
 "أُبدِي اهتمام في الإجابات":"Implementation interest indicated (local response)",
 "الحقول التي تفيد الفريق فعلاً في موجز المراجعة":"Fields the team actually finds useful in the review brief",
 "طريقة مشاركة الموجز التي توافق عليها الإدارة":"Management-approved way to share the brief",

 "هذه رغبتك البصرية فقط؛ سيظل التوفر والتجهيزات والسعر والتنفيذ بحاجة لمراجعة القاعة.":"This is your visual preference only; actual availability, furnishings, pricing and execution require venue team review.",
 "ثلاث قراءات مفاهيمية مبنية فقط على تفضيلاتك المؤكدة.":"Three conceptual interpretations based solely on your confirmed preferences.",
 "يركز على ما اخترته أنت:":"Emphasizing what you selected:",
 "اتجاه بديل أعجبني":"I also like this alternative",
 "هذا أقرب لما أتخيله":"This is closest to my vision",
 "مستوى التفاصيل":"Detail level",
 "مرجع بصري مضاف من العميل":"Customer-added visual reference",
 "الاتجاه البصري المختار":"Selected visual direction",
 "الألوان المرجعية":"Reference colors",
 "تفضيلات الإضاءة":"Lighting preferences",
 "طلب مفضل — وليس تأكيد توفر":"Requested date only — availability not confirmed",
 "معلومة من العميل — وليست تحققاً من سعة القاعة":"Customer-supplied guest count — capacity not verified",
 "الطابع المختار":"Selected style",
 "الأولويات البصرية":"Visual priorities",
 "تصور استرشادي — ليس تجهيزاً معتمداً":"Illustrative concept — not an approved setup",
 "تم استخدام الألوان المحددة كمرجع":"Selected colors are now used as a reference",
 "ألوان مرجعية":"Reference colors",
 "تفاصيل":"Details",
 "أجواء":"Atmosphere",
 "ألوان":"Colors",
 "الأولوية البصرية":"Visual priority",
 "هذا تصور استرشادي":"This is an illustrative concept"
};
const fragments=[
 [/(\d+)\s*ضيف متوقع/g,"$1 expected guests"],
 [/(\d+)\s*درجات مرجعية مقترحة/g,"$1 suggested reference colors"],
 [/(\d+)\s*درجات مرجعية أكدها العميل/g,"$1 reference colors confirmed by the customer"],
 [/(\d+)\s*درجات مرجعية/g,"$1 reference colors"],
 [/تمت إضافة صورة:\s*/g,"Image added: "],
 [/صورة مرفوعة:\s*/g,"Uploaded image: "],
 [/يحتاج مراجعة فريق القاعة/g,"Requires review by the venue team"],
 [/تصور بصري استرشادي/g,"Illustrative visual concept"],
 [/التفضيلات الأساسية مكتملة/g,"Core preferences complete"],
 [/يمكنك الآن مقارنة ثلاث قراءات مفاهيمية/g,"You can now compare three conceptual directions"],
 [/التركيز البصري على/g,"Visual emphasis on"],
 [/الأولوية:/g,"Priority:"],
 [/الأجواء:/g,"Atmosphere:"],
 [/الألوان:/g,"Colors:"],
 [/الإضاءة:/g,"Lighting:"],
 [/درجة التفاصيل:/g,"Detail level:"],
 [/مرجع بصري/g,"Visual reference"],
 [/الاتجاه \s*([١٢٣۱۲۳123])/g,(_,n)=>"Direction "+(numerals[n]||n)],
 [/أولويّة/g,"Priority"],
 [/ · /g," · "]
];
function numberLatin(text){return String(text).replace(digits,d=>numerals[d]||d)}
function formatDate(text){
 let s=numberLatin(text);
 const months={"يناير":"January","فبراير":"February","مارس":"March","أبريل":"April","ابريل":"April","مايو":"May","يونيو":"June","يوليو":"July","أغسطس":"August","اغسطس":"August","سبتمبر":"September","أكتوبر":"October","نوفمبر":"November","ديسمبر":"December"};
 for(const [ar,en] of Object.entries(months))s=s.replaceAll(ar,en);
 return s;
}
function dynamicSummary(){
 const txt=(id)=>document.getElementById(id)?.textContent.trim()||"";
 const context=[
  ["Event",txt("briefEvent")],
  ["Preferred date (request only)",txt("briefDate")],
  ["Expected guests (customer input)",txt("briefGuests")],
  ["Preferred conceptual direction",txt("briefP3Preferred")],
  ["Atmosphere",txt("briefP2Atmosphere")],
  ["Colors",txt("briefP2Palette")],
  ["Lighting preference",txt("briefP2Lighting")],
  ["Detail level",txt("briefP2Detail")],
  ["Visual priorities",txt("briefP2Focus")],
  ["Keep from preferred direction",txt("briefP3Keep")]
 ].filter(([key,val])=>val&&!/^(لم يحدد بعد|لم تحدد بعد|لم يضف مرجع بعد|بانتظار اختيار العميل|لا يوجد اختيار بديل|Not specified yet|Awaiting customer selection|No alternative selected)$/i.test(val));
 return context.map(([key,val])=>key+": "+translate(val)).join(". ")+". Actual capacity, date availability, furnishings, pricing, and execution require Lany Hall team confirmation.";
}
function managementSummary(){
 const val=name=>document.querySelector('input[name="'+name+'"]:checked')?.value||"";
 const options={
  benefit:{yes:"Yes",partial:"Partly",no:"No"},
  useful:{intent:"Clarifying customer wishes",inspiration:"Visual inspiration",direction:"Choosing a direction",brief:"Review summary",none:"None of these"},
  fit:{yes:"Matches our process",partial:"Partly matches",no:"Does not match",unknown:"Cannot assess yet"},
  standard:{partial:"Some parts may be standardized",unique:"Usually handled differently",vendors:"Depends on suppliers",unclear:"Needs clarification"},
  data:{yes:"Some data could be discussed",unclear:"Scope needs to be defined first",no:"Not available / cannot share"},
  interest:{discussion:"Wants to discuss implementation",adjust:"Needs changes before deciding",useful_no:"Useful but no need to implement",no:"No present need"}
 };
 const chosen=(key)=>options[key]?.[val(key)]||"Not answered";
 const free=id=>document.getElementById(id)?.value?.trim()||"Not provided";
 const verdict=document.getElementById("resultTitle")?.textContent.trim()||"UNDETERMINED";
 return [
  "Lany Hall concept review — local, unsent responses",
  "Perceived benefit: "+chosen("benefit"),
  "Closest part: "+chosen("useful"),
  "Process fit: "+chosen("fit"),
  "What does not match: "+free("mismatch"),
  "Information normally needed: "+free("needed"),
  "Standardization: "+chosen("standard"),
  "Data access: "+chosen("data"),
  "Implementation interest: "+chosen("interest"),
  "Indicative local verdict: "+verdict,
  "OFFER_READY: NO — local responses alone do not establish budget, paid approval, or agreed scope."
 ].join("\n");
}
function managementReason(){
 const val=document.getElementById("resultTitle")?.textContent.trim()||"";
 if(val==="STOP")return "The locally entered answers do not support continuing the concept in its current form. Do not force a paid project.";
 if(val==="NARROW")return "A smaller part may be useful, but the full concept is not yet justified. Validate a narrower scope with real management.";
 if(val==="CONTINUE")return "These local answers suggest relevance, potential process fit and interest in discussing data and implementation. They justify further real-world validation only — not a quote or a sale.";
 return "Complete the questions to assess the concept. No management validation is implied.";
}
function translate(raw,node){
 const source=String(raw),match=source.match(/^(\s*)([\s\S]*?)(\s*)$/);
 const before=match?.[1]||"",v=match?.[2]||"",after=match?.[3]||"";
 if(!arabic.test(v))return source;
 if(pageKind==="review"&&(node?.parentElement?.id==="feedbackSummary"||node?.parentElement?.closest("#feedbackSummary")))return managementSummary();
 if(pageKind==="review"&&(node?.parentElement?.id==="resultReason"||node?.parentElement?.closest("#resultReason")))return managementReason();
 if(STRINGS[v])return before+STRINGS[v]+after;
 if(ATTRS[v])return before+ATTRS[v]+after;
 if(termMap[v])return before+termMap[v]+after;
 if(dynamicMap[v])return before+dynamicMap[v]+after;
 if(v.startsWith("تمت إضافة مرجع:"))return before+"Reference added: "+v.slice("تمت إضافة مرجع:".length).trim()+after;
 if(v.startsWith("اتجاهك المفضل:"))return before+"Your preferred direction: "+translate(v.slice("اتجاهك المفضل:".length).trim())+after;
 // The final summary is regenerated deterministically from customer-confirmed fields.
 if(node?.parentElement?.closest("#p4Summary")||node?.parentElement?.id==="p4Summary")return dynamicSummary();
 if(node?.parentElement?.closest("#p3DecisionSummary")||node?.parentElement?.id==="p3DecisionSummary")return "The preferred visual direction is based on customer-selected preferences only, and remains subject to Lany Hall review.";
 if(node?.parentElement?.closest("#briefP3Summary")||node?.parentElement?.id==="briefP3Summary"){
   const chosen=translate(document.getElementById("briefP3Preferred")?.textContent.trim()||"");
   return "The customer prefers the conceptual direction "+chosen+". This is a preference for team review, not a confirmed venue setup.";
 }

 if(/^(\d+|[٠-٩]+)\s*ضيف/.test(v))return before+numberLatin(v).replace(/ضيف متوقع/g,"expected guests")+after;
 let s=formatDate(v);
 for(const [re,to] of fragments)s=s.replace(re,to);
 for(const [ar,en] of Object.entries(dynamicMap).sort((a,b)=>b[0].length-a[0].length)){
  if(s.includes(ar)&&ar.length>2){
    try{
      const escaped=ar.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
      s=s.replace(new RegExp("(?<![\\u0600-\\u06FF])"+escaped+"(?![\\u0600-\\u06FF])","g"),en);
    }catch{}
  }
 }
 s=s.replace(/([A-Fa-f0-9]{6})،\s*/g,"$1, ");

 if(STRINGS[s])s=STRINGS[s];
 if(arabic.test(s)){
   for(const [ar,en] of Object.entries(termMap).sort((a,b)=>b[0].length-a[0].length)){
      const escaped=ar.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
      try{s=s.replace(new RegExp("(?<![\\u0600-\\u06FF])"+escaped+"(?![\\u0600-\\u06FF])","g"),en)}catch{}

   }
 }
 // do not fabricate or mistranslate unknown customer-written free text
 return before+s+after;
}
function walkText(root,cb){
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(w.nextNode()) {
  const n=w.currentNode;
  if(n.parentElement?.closest("script,style,noscript,textarea,select,#wrLanguage"))continue;
  cb(n);
 }
}
function processText(n){
 let now=n.nodeValue;if(!now)return;
 let st=saved.get(n);
 if(!st){st={ar:now,output:now};saved.set(n,st)}
 else if(now!==st.output)st.ar=now;
 const target=lang==="en"?translate(st.ar,n):st.ar;
 st.output=target;
 if(now!==target)n.nodeValue=target;
}
function processAttrs(element){
 if(!element||element.nodeType!==1||element.closest("#wrLanguage"))return;
 let records=savedAttributes.get(element);if(!records){records={};savedAttributes.set(element,records)}
 for(const attr of ["placeholder","title","alt","aria-label"]){
  if(!element.hasAttribute(attr))continue;
  const now=element.getAttribute(attr);
  let state=records[attr];
  if(!state){state={ar:now,output:now};records[attr]=state}
  else if(now!==state.output)state.ar=now;
  const rendered=lang==="en"?translate(state.ar):state.ar;
  state.output=rendered;if(rendered!==now)element.setAttribute(attr,rendered);
 }
}
function process(root=document.body){
 if(!root)return;
 if(root.nodeType===3){processText(root);return}
 if(root.nodeType!==1&&root.nodeType!==9)return;
 if(root.nodeType===1){if(root.closest("#wrLanguage,script,style,noscript"))return;processAttrs(root)}
 walkText(root,processText);
 root.querySelectorAll?.("[placeholder],[title],[alt],[aria-label]").forEach(processAttrs);
}
function updateRoot(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==="en"?"ltr":"rtl";
 document.body.classList.toggle("wr-is-en",lang==="en");
 document.querySelectorAll("#wrLanguage button").forEach(b=>{
   const on=b.dataset.lang===lang;b.setAttribute("aria-pressed",String(on));
 });
 const title=pageKind==="review"?"Lany Hall — Management Concept Review":"Lany Hall · Areen Airport Hotel — Visual Planning Concept";
 const arabicTitle=pageKind==="review"?"عرض الفكرة للإدارة — لاني":"قاعة لاني — فندق أرين المطار — تصور مناسبتك";
 document.title=lang==="en"?title:arabicTitle;
 const desc=document.querySelector('meta[name="description"]');
 if(desc&&pageKind==="customer")desc.content=lang==="en"?"A visual planning concept to clarify event preferences before Lany Hall team review. No bookings, pricing or live availability.":"تصور مبدئي لتوضيح رغبتكم قبل مراجعة فريق قاعة لاني — فندق أرين المطار.";
}
function setLanguage(next){
 if(next!=="ar"&&next!=="en")return;
 lang=next;localStorage.setItem(STORAGE_KEY,lang);
 updateRoot();process();
 // Update cross-route links without changing navigation behavior.
 document.querySelectorAll('a[href="/"],a[href="/review/"]').forEach(a=>{
   const path=a.getAttribute("href").split("?")[0];
   a.href=path+(lang==="en"?"?lang=en":"");
 });
}
async function writeLocalClipboard(value){
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(value);return true;}}catch{}
  const temp=document.createElement("textarea");
  temp.value=value;
  temp.setAttribute("readonly","");
  temp.style.cssText="position:fixed;opacity:0;pointer-events:none;left:-9999px;top:0";
  document.body.appendChild(temp);
  temp.focus();
  temp.select();
  temp.setSelectionRange(0,temp.value.length);
  let done=false;
  try{done=document.execCommand("copy")===true}catch{}
  temp.remove();
  return done;
}
function install(){
 const holder=document.createElement("div");holder.id="wrLanguage";holder.className="wr-language-toggle";
 holder.setAttribute("role","group");holder.setAttribute("aria-label","Language / اللغة");
 holder.innerHTML='<button type="button" data-lang="ar" aria-label="العربية" aria-pressed="true">AR</button><span aria-hidden="true">/</span><button type="button" data-lang="en" aria-label="English" aria-pressed="false">EN</button>';
 const anchor=pageKind==="review"?document.querySelector("header .top"):document.querySelector(".hero .topbar");
 if(anchor)anchor.appendChild(holder);else document.body.prepend(holder);
 holder.addEventListener("click",e=>{const b=e.target.closest("button[data-lang]");if(b)setLanguage(b.dataset.lang)});
 updateRoot();process();
 const ob=new MutationObserver(records=>{
   const roots=new Set;
   for(const record of records){
      if(record.type==="characterData"){if(record.target.parentElement?.closest("#wrLanguage"))continue;processText(record.target)}
      else if(record.type==="attributes")processAttrs(record.target);
      else for(const n of record.addedNodes)if(n.nodeType===1||n.nodeType===3)roots.add(n);
   }
   roots.forEach(process);
 });
 ob.observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["placeholder","title","alt","aria-label"]});
 // For English copies, generate a real, local English brief; never imply submission.
 if(pageKind==="customer"){
  const copy=document.getElementById("p4Copy");
  copy?.addEventListener("click",async e=>{
   if(lang!=="en")return;
   e.stopImmediatePropagation();e.preventDefault();
   const text=dynamicSummary()+"\n\nEvent details and visual preferences are customer-supplied. No request has been sent or booked.";
   try{
    if(!await writeLocalClipboard(text))throw new Error("Copy denied");
    const status=document.getElementById("p4ActionStatus");
    if(status)status.textContent="English brief copied to your device. Nothing was sent to the venue.";
   }catch{
    const status=document.getElementById("p4ActionStatus");if(status)status.textContent="Copy unavailable. Please select and copy the brief manually.";
   }
  },true);
 }else{
  const btn=document.getElementById("copyFeedback");
  btn?.addEventListener("click",async e=>{
   if(lang!=="en")return;
   e.stopImmediatePropagation();e.preventDefault();
   const summary=document.getElementById("feedbackSummary")?.innerText.trim()||"No feedback entered yet.";
   const title=document.getElementById("resultTitle")?.innerText.trim()||"";
   const reasons=document.getElementById("resultReason")?.innerText.trim()||"";
   const notes="Lany Hall management concept review (local draft, not an official response)\n"+title+"\n"+reasons+"\n"+summary+"\n\nNothing has been submitted to Lany Hall or saved in a CRM.";
   try{
    if(!await writeLocalClipboard(notes))throw new Error("Copy denied");
    const status=document.getElementById("copyStatus");if(status)status.textContent="Local English feedback copied. Nothing was sent.";
   }catch{
    const status=document.getElementById("copyStatus");if(status)status.textContent="Copy unavailable in this browser.";
   }
  },true);
 }
 setLanguage(lang);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
else install();
window.WhiteRoseLocale={setLanguage,get current(){return lang},translate};
})();
