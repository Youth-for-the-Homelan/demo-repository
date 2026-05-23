import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback high-fidelity simulation engine when Gemini Key is absent or during tests
function generateFallbackSimulation(scenario: string) {
  const isArabic = /[\u0600-\u06FF]/.test(scenario);
  
  const isFamine = /الرمادة|المجاعة|جائع|قحط|famine|starvation|hunger/i.test(scenario);
  const isWellMonopoly = /بئر|رومة|مائي|well|water|potable|monopoly/i.test(scenario);
  const isJudiciary = /درع|شريح|القاضي|محكمة|judiciary|court|shield|ali/i.test(scenario);
  const isWeakEmpowerment = /أبي بكر|ابتزاز|ضعيف|syndicate|workshop|intimidation|weak/i.test(scenario);

  if (isArabic) {
    let histRef = "ميثاق المدينة المنورة (عهد المؤاخاة)";
    let seerahDet = "تطبيق مبدأ 'أنهم أمة واحدة من دون الناس' ومبدأ التكافل الاجتماعي حيث يُقعد عاقلهم ويفك عانيهم بالمعروف والقسط بين المؤمنين.";
    let quote = "«الصلح جائز بين المسلمين إلا صلحاً حرم حلالاً أو أحل حراماً، والمسلمون على شروطهم»";
    let intentClass = "Needs Support (بحاجة لدعم ومساندة)";
    let intentAnal = `تحليل النية للمدخل: "${scenario}". يُظهر السلوك رغبة واضحة في حل المشكلة جماعيًا مع وجود تطلعات لتحسين البيئة الاجتماعية.`;
    let decisionSum = "التوصية بالمسار الهجين: تفعيل المصالحة الفورية مع وضع إطار تنظيمي عادل ومحكم يضمن الحقوق ويسهل على المحتاجين.";
    let resDetails = "تخصيص دعم مباشر من صندوق التكافل / الزكاة بقيمة 15% من الاحتياطي لسد الاحتياج الفوري لشبكة الأفراد المتأثرين.";
    let antiCheck = "لم يتم رصد أي شبهة استغلال، احتكار، أو معاملات ربوية في السيناريو المطروح.";
    let risk = 12;
    let overrideRec = "التغاضي عن الهفوات البسيطة وتغليب التيسير على التعسير، تفعيلًا للمبدأ النبوي: 'يسروا ولا تعسروا ونفروا ولا تنفروا'.";

    if (isFamine) {
      histRef = "عام الرمادة وتعطيل العقوبة للشبهة (عمر بن الخطاب رضي الله عنه)";
      seerahDet = "عطّل الفاروق عمر رضي الله عنه عقوبة رادعة بحق الجياع لعلمه بنية الاضطرار للبقاء وسد الرمق، مقرراً تغليب الرعاية والإنقاذ على القانون الجاف وتدشين مطابخ إعانة شاملة لترميم المجتمع من المسغبة والممغصة الكبرى.";
      quote = "«ادْرَؤُوا الحُدُودَ بِالشُّبُهَاتِ»، وتطبيق الفقهاء لمبدأ لا عقاب ولا قطع تحت وطأة المجاعة والقفر المستحكم.";
      intentClass = "Urgent Emergency Overridden (حالة اضطرار معفاة)";
      intentAnal = "تحليل النية يكشف عن اضطرار بدافع الجوع والبقاء الحرج، مما يرفع المسؤولية الجنائية ويلزم النظام بتقديم الدعم الفوري كبديل للمساءلة البيروقراطية الروبوتية.";
      decisionSum = "إسقاط كافة المطالبات الجنائية أو التعويضية الفورية، وإلزام بيت المال (الخزينة العامة) بتعويض مالك المخزن وسد فجوة عيش الأفراد المتأثرين كلياً.";
      resDetails = "الاستنفار الكامل لصناديق الصدقات والتكافل، وضخ مؤن غذائية من مستودعات الطوارئ المركزية مجاناً للأسر المنكوبة لتأمين العيش الكريم.";
      antiCheck = "تم فحص الموقف وتبرئة السلوك من تهمة خرق النظام؛ كشفت الخوارزمية أن الموقف بدافع سد كربة اضطرارية إنسانية مشروعة تتقدم على حرمة المعاملات الباردة.";
      risk = 5;
      overrideRec = "توصية الفاروق عمر الكبرى: التيسير المطلق وإطعام الجوعى وتعليق القوانين التي تزيد مشقة المحتاجين في أوقات الأزمات العامة والقحط المتربص بالناس.";
    } else if (isWellMonopoly) {
      histRef = "شراء بئر رومة وتوفير مياه عذبة عامة الوقف (عثمان بن عفان رضي الله عنه)";
      seerahDet = "اشترى ذو النورين عثمان رضي الله عنه بئر الماء العذب الوحيد من مالكه المحتكر الذي كان يستنزف أموال رعية المدينة ويمنع الفقراء منها، فتبرع بها عثمان كـ 'وقف مسبل' ومجاني للجمهور، ضارباً أروع أمثلة محاربة احتكار المرافق العامة الأساسية وحماية البنى الاقتصادية للتنمية.";
      quote = "قوله صلى الله عليه وسلم: «من حفر بئر رومة فله الجنة»، وتأصيل قاعدته المالية بتقديم المنافع الخدمية المشتركة على غلبة التكسّب الفردي والمتاجرة بالأقوات.";
      intentClass = "Anti-Utility Monopoly (مكافحة احتكار المرافق العامة)";
      intentAnal = "تحديد نية السلوك كأنانية وااحتجاز لمرفق حيوي لا يستغني عنه المجتمع السكني، مما يشكل تهديداً لسلامة العيش وخرقاً للتضامن التعاوني المفروض في أمة واحدة.";
      decisionSum = "إلغاء أحقية التسعير الفردي المشط وتحويل المرفق المائي أو السلعي الحيوي إلى نظام تشغيل وقفي تشاركي يوفر الاحتياج الأساسي مجاناً للجميع بلا ضرر ولا ضرار.";
      resDetails = "تفعيل تمويل الوقف والاستثمارات الاجتماعية لشراء أو استئجار المرفق رغماً عن تعنت المستغلين وتوفير تدفق مستدام للمياه مجاناً مع تعويض مالي عادل لبناء الخزانات.";
      antiCheck = "إيقاف الاحتكار بنسبة 100% وإجبار المالك على الخضوع لتعرفة اجتماعية مدعومة تحت طائلة النزع والتحويل للوقف الخيري العام تحت إشراف أمناء السوق.";
      risk = 45;
      overrideRec = "توصية ذي النورين الكبرى: كسر طوق الاستغلال للموارد الحياتية (كالماء والكهرباء والغذاء) وتحويلها لمشاع مجاني مدعوم يضمن كرامة غسيل العيش الإنساني.";
    } else if (isJudiciary) {
      histRef = "خصومة درع أمير المؤمنين علي بن أبي طالب أمام قاضي الدولة";
      seerahDet = "مثل علي بن أبي طالب وهو خليفة الدولة ورئيس السلطة التنفيذية بجوار مواطن عادي في مجلس شريح القاضي، وقضى القاضي للخصم العادي لافتقار الخليفة للبينة المستندية الكافية، فامتثل الخليفة بكل سرور ووقار لقوة القضاء العادل، فأسلم الخصم من دقة نزاهة الحكم.";
      quote = "حديث: «إنما أنا بشر وإنه يأتيني الخصم فلعل بعضكم أن يكون أبلغ من بعض...»، ورسالة عمر القضائية: «آسِ بين الخصوم في وجهك وعدلك ومجلسك حتى لا يطمع شريف في حيفك».";
      intentClass = "Sovereign Equality Alignment (تطابق المساواة السيادية)";
      intentAnal = "تحليل النية يتوافق بشكل مذهل مع حماية المساواة المدنية؛ حيث تخضع أعلى مراتب السلطة لنفس مساطر الإثبات المفروضة على أقل الرعية شأناً بلا وساطة ولا نفوذ خاص.";
      decisionSum = "رفض تغليب الادعاء السلطوي غير المسند بالأدلة العينية الواضحة، والحكم لصالح الطرف البسيط كحماية لنزاهة ونضج الإثبات في المنظومة وإسقاط الهيبة السياسية أمام القانون.";
      resDetails = "الامتناع عن اقتطاع أي حصة مادية من الخصم لعدم كفاية الدليل، وتوجيه الدعم الفني والقضائي للخصم الضعيف لتقليل التوتر واستقرار نسيج الأمة.";
      antiCheck = "تأصيل نزاهة النظام وعدم الخضوع للأقوياء أو التميز المعنوي، وتطبيق حافز القضية العادلة على الجميع بالتساوي التام كمسطرة واحدة لا تشوبها مصالح السيادة المفرطة.";
      risk = 2;
      overrideRec = "توصية وموقف الإمام علي الخالد: 'إن كمال السلطة ونزاهتها يتمثل في خضوعها الذاتي التام لدائرة القضاء العادل وتأمين ثقة الضعفاء في أجهزة الحكم والامتثال للشورى الدستورية'.";
    } else if (isWeakEmpowerment) {
      histRef = "عهد الصديق ومبادئ نصرة ومؤازرة الفئات الضعيفة (أبو بكر الصديق رضي الله عنه)";
      seerahDet = "أصّل الصديق أبو بكر رضي الله عنه منذ أول دقيقة في خلافته أن العدالة هي المقوم الأول للوجود السياسي للدولة، وأن الغرض من سلطتها الرسمية غلبة الحق لصف الضعيف المستضام في وجه المتنفذين والكيانات الاحتكارية.";
      quote = "قول الصديق الخالد في بيعته بوقار: «الضعيف فيكم قوي عندي حتى أرجع عليه حقه إن شاء الله، والقوي فيكم ضعيف عندي حتى آخذ الحق منه إن شاء الله».";
      intentClass = "Uplifting the Vulnerable (دعم الفئة المستضعفة ومجابهة الاستبداد)";
      intentAnal = "تحليل النية يكشف عن بغي واستغلال نفوذ ومحاولة سحق لكيان مهني أو اجتماعي ضعيف بهدف ترسيخ السيطرة الإقصائية الأحادية وقمع ريادة الأعمال الصغيرة.";
      decisionSum = "حظر كافة ممارسات الابتزاز والإقصاء القسري فوراً، وإرغام الطرف المعتدي أو واسع النفوذ على تقديم اعتذار موثق وعقد شراكة تعويضية عادلة مع الالتزام بتوافر العرض اللوجستي المفتوح.";
      resDetails = "صرف حزمة عاجلة ومساندة لوجستية تمكينية للفئة الضعيفة لترقية قدراتهم وحمايتهم من شبكات الغبن والاستبعاد السوقي والتجاري المفرط.";
      antiCheck = "رصد خرق لميثاق الأمانة والعهود المشتركة، والقيام بتسجيل المبتز واسع النفوذ في سجل العقوبات الأخلاقية وحظر امتيازاته السوقية مؤقتاً لردعه كلياً عن العبث بالرعية.";
      risk = 30;
      overrideRec = "توجيه ومنشور الصديق الصارم: إرساء ميزان حماية القويات المهددة للضعيف، وتفعيل الحصار التنظيمي للمتنفذ العابث برزق ومعاملات عباد الله الكرام وتحقيق النفع المتبادل.";
    }

    return {
      originalScenario: scenario,
      language: "ar",
      layer0: {
        alignment: "التوافق الأخلاقي الأساسي: متوافق بنسبة 95%",
        principlesChecked: [
          { name: "التوحيد (SSOT)", status: "متوافق", notes: "توجيه كافة المدخلات إلى مصدر الحقيقة الأخلاقي الموحد." },
          { name: "العدل (Fairness)", status: "نشط", notes: "تم تطبيق محددات العدالة لجميع الأطراف المعنية بالتساوي." },
          { name: "الرحمة (Human-Centric)", status: "نشط", notes: "تحسين مخرجات النظام لتقليل المشقة وتسهيل الإجراءات المستدامة." },
          { name: "الأمانة (Integrity)", status: "متوافق", notes: "تأمين سلامة البيانات ومنع التحوير تفعيلًا لبروتوكول الثقة." },
          { name: "عدم الإفساد (Safety)", status: "آمن", notes: "حصار أي سلوكيات تضر بالبيئة أو المجتمع." }
        ]
      },
      layer1: {
        intentClassified: intentClass,
        intentionAnalysis: intentAnal,
        moralRiskScore: risk,
        trustAdjustment: 5
      },
      layer2: {
        agents: [
          { name: "مصلح (المنسق الاجتماعي)", comment: "نقترح البدء بمسار الصلح والتآخي لتأليف القلوب وتقريب وجهات النظر قبل الاحتكام للمساطر الصلبة." },
          { name: "عادل (حارس الميزان القضائي)", comment: "يجب تطبيق قواعد ثابتة وضمان ألا يظلم أحد، وتحديد الالتزامات بوضوح موثق." },
          { name: "أمير/أمين (المنفذ التنظيمي)", comment: "سنضع خطة تشغيلية مرنة تستوعب المدخلات وتوزع المهام على الأفراد كلٌ حسب كفاءته ولين عريشته." }
        ],
        voteOutcome: "إجماع الشورى والعدل المدني للصحابة",
        shuraDecisionSummary: decisionSum
      },
      layer3: {
        nodesAffected: ["نواة المجتمع المحلي", "بروتوكول المؤاخاة وقرارات الخلفاء"],
        trustGraphUpdate: "ارتفاع مؤشر الثقة العام بمقدار +15 نقطة في الشبكة المحلية بعد دمج precedent الخلافة الراشدة.",
        resourceRedistributionTrigger: "نشط",
        resourceDetails: resDetails
      },
      layer4: {
        antiExploitCheck: antiCheck,
        subsidyRequired: true,
        subsidyDetails: "توفير دعم للمدخلات السلعية والخدمية الأساسية لتخفيف التكلفة الاقتصادية بنسبة 30%.",
        fairTransactionComment: "المعاملة تتوافق مع معايير الصدق والوضوح الفقهية والأخلاقية وصيانة المرافق من الاحتكار الشاط."
      },
      layer5: {
        conflictLevel: "Medium (متوسط)",
        mediationSteps: [
          "1. تفعيل حوار ثنائي مغلق بعيدًا عن المؤثرات الخارجية لتحديد نقاط الخلاف الحقيقية.",
          "2. تقريب وجهات النظر باقتراح التنازل المتبادل لمصلحة الجماعة (صلح تاريخي).",
          "3. توثيق الاتفاق بصك أخلاقي ملزم ومشهود عليه لتثبيت السلم الأهلي."
        ],
        reconciliationStrategy: "التودد والتعويض العادل للطرف الأقل حظًا كضمانة لاستدامة الوفاق المجتمعي."
      },
      layer6: {
        historicalReference: histRef,
        seerahDetails: seerahDet,
        evidenceQuote: quote,
        noHallucinationFlag: true
      },
      layer7: {
        apiActions: [
          { trigger: "DISPATCH_UMMAH_SUPPORT_TASK", params: { urgency: "High", target: "Local Network Nodes" } },
          { trigger: "LOG_ETHICAL_TRANSACTION", params: { verified: true, rate: "Fair" } }
        ]
      },
      layer8: {
        globalHarmScore: 5,
        killSwitchStatus: "Clear (مأمون)",
        mercyOverrideActive: true,
        mercyRecommendation: overrideRec
      }
    };
  } else {
    let histRef = "The Charter of Medina & Act of Fraternization (Mu'akhah)";
    let seerahDet = "In Medina, the Prophet fostered an economic-social pact establishing common defense and mutual social insurance ('Fidyah' or ransom distribution) for needy members.";
    let quote = "A believer to another believer is like a building whose different parts support each other.";
    let intentClass = "Needs Support";
    let intentAnal = `Evaluating intention for input: "${scenario}". User shows structural need or cooperative instinct, raising constructive alignment potential.`;
    let decisionSum = "Adopt hybrid peaceful alignment. Address immediate material relief first to secure trust, followed by documented covenant protocols.";
    let resDetails = "Triggering voluntary and institutional distribution pools (Zakat/Sadaqah structure) to close the variance gap by 20%.";
    let antiCheck = "No signs of modern or traditional user exploitation, artificial inflation, or usury detected.";
    let risk = 10;
    let overrideRec = "Adopt extreme tolerance and ease. Follow the golden principle: 'Make things easy and do not make them difficult, cheer people up and do not repel them.'";

    if (isFamine) {
      histRef = "The Year of Famine & Larceny Penalty Suspension (Umar Al-Khattab)";
      seerahDet = "Caliph Umar Al-Khattab suspended standard penal consequences during the extreme famine ('Year of Ash') upon tracing desperate hunger. He shifted state actions from punitive enforcement to active restorative support and direct food kitchens.";
      quote = "'Ward off legal penalties by doubts (Shubuhat)', and judicial precedents declaring no larceny cut under continuous drought and food scarcity.";
      intentClass = "Urgent Emergency Overridden";
      intentAnal = "Intent analysis shows emergency necessity for physical survival, removing legal liability and triggering direct state-issued relief over robotic prosecution.";
      decisionSum = "Dismiss all formal legal charges and compensate the asset owner from the public treasury (Bayt al-Mal) to maintain social harmony.";
      resDetails = "Dispatch immediate grains and core provisions to the vulnerable families from central emergency stockpiles with no administrative debt.";
      antiCheck = "Behavior evaluated as an act of absolute biological necessity, maintaining the user's high ethical score without any penalty logs.";
      risk = 5;
      overrideRec = "Caliph Umar's legacy: Prioritize saving lives and ease over cold literalism during crises of general destitution.";
    } else if (isWellMonopoly) {
      histRef = "Potable Water Well Acquisition & Public Waqf (Uthman ibn Affan)";
      seerahDet = "When an exploitative merchant monopolized Medina's sole freshwater well and overcharged citizens, Uthman purchased the well and endowed it as a free public Waqf, ensuring equal access for all without financial barrier.";
      quote = "The Prophetic statement: 'He who buys the well of Roomah shall have Paradise', and the axiom: 'People are equal partners in three public assets: Water, Pasture, and Fire.'";
      intentClass = "Anti-Utility Monopoly Action";
      intentAnal = "The target merchant intent is assessed as a rent-seeking monopoly of a life-essential utility, breaching the communal trust and solidarity protocol.";
      decisionSum = "Nullify unilateral price manipulation. Convert the monopolized water source into a decentralized public Waqf with zero access fees.";
      resDetails = "Fund the buyout of the infrastructure through social endowment pools, making freshwater fully free while assuring equitable upkeep.";
      antiCheck = "Anti-exploitation protocol triggered. Absolute check completed; forced pricing cap applied to stabilize the local utility cost.";
      risk = 40;
      overrideRec = "Caliph Uthman's precedent: Basic human utilities must remain free of speculative monopolies to guarantee essential survival indices.";
    } else if (isJudiciary) {
      histRef = "The Lost Sovereign Shield Case Before Impartial Judiciary (Ali ibn Abi Talib)";
      seerahDet = "Ali ibn Abi Talib (the ruling Caliph) stood in trial with a humble citizen over an armor shield. The judge ruled against the Caliph because he lacked formal eyewitnesses. Ali gladly accepted the verdict, showcasing total political parity.";
      quote = "The classic judicial guide: 'Equate all contestants in your gaze, court seating, and justice, so that no powerful expects your bias, and no weak despairs of your fairness.'";
      intentClass = "Sovereign Equality Test";
      intentAnal = "The intent demonstrates compliance with the integrity of the judicial process. Highest executive officers submit equally to evidentiary rules as any citizen.";
      decisionSum = "Disallow sovereign priority claim. Rule in favor of the ordinary citizen to uphold the independence of the judiciary and prevent abuse of authority.";
      resDetails = "Provide neutral legal representation support and enforce the court's decree without any state retaliation or interference.";
      antiCheck = "Absolute equality protocol cleared. Case logged as a hallmark of state integrity and non-coercive executive compliance.";
      risk = 2;
      overrideRec = "Caliph Ali's guide: The legitimacy of executive power lies entirely in its complete submission to impartial justice and standard evidentiary checks.";
    } else if (isWeakEmpowerment) {
      histRef = "Abu Bakr Al-Siddiq's Weak-Support Manifesto & Executive Pledge";
      seerahDet = "Upon assumption of the leadership, Caliph Abu Bakr decreed that the core function of governance is to equalise societal power, making the weak powerful under state protection until their rights are restored.";
      quote = "Abu Bakr's decree: 'The weak among you is strong with me until I secure their rights, and the strong among you is weak with me until I take others' rights from them.'";
      intentClass = "Uplifting the Vulnerable";
      intentAnal = "Assessment detects structural bullying and coercive tactics from an elite merchant conglomerate attempting to force out a micro-cooperative.";
      decisionSum = "Enforce a strict anti-intimidation covenant. Restrict the conglomerate's monopolistic distribution lanes and secure the weaker guild's market space.";
      resDetails = "Allocate a baseline grant to the micro-cooperative to support supply chains and empower their commercial self-sufficiency.";
      antiCheck = "Predatory distraction recorded. Conglomerate marked as high-risk for predatory practices; subjected to closer compliance monitoring.";
      risk = 25;
      overrideRec = "Abu Bakr's guiding mandate: Direct administrative power proactively to safeguard small creators against elite merchant intimidation.";
    }

    return {
      originalScenario: scenario,
      language: "en",
      layer0: {
        alignment: "Ethical Philosophy Alignment: 97% Commended",
        principlesChecked: [
          { name: "Tawheed (SSOT)", status: "Aligned", notes: "Directing all model inputs to unified core truth protocols." },
          { name: "Adl (Fairness)", status: "Active", notes: "Fairness constraints evaluated for all impacted nodes." },
          { name: "Rahmah (Human-Centric)", status: "Active", notes: "System optimized to prevent burden and promote absolute utility." },
          { name: "Amanah (Trust Protocol)", status: "Aligned", notes: "Data integrity and authentic lineage verified across all vectors." },
          { name: "Non-Mischief (Safety)", status: "Safe", notes: "Prevention of structural decay, waste, or environmental harm verified." }
        ]
      },
      layer1: {
        intentClassified: intentClass,
        intentionAnalysis: intentAnal,
        moralRiskScore: risk,
        trustAdjustment: 8
      },
      layer2: {
        agents: [
          { name: "Muslih (Peacemaker Agent)", comment: "Recommend soft dialog first. Heart reconciliation maintains network resilience before legal constraints are enforced." },
          { name: "Adil (Law Guardian Agent)", comment: "Ensure all expectations are explicitly detailed and document agreements securely to prevent future variance." },
          { name: "Amin (Pragmatic Administrator)", comment: "Deploy modular workflows. Assign tasks proportional to skill and capabilities to sustain operational efficiency." }
        ],
        voteOutcome: "Unanimous Shura Consensus",
        shuraDecisionSummary: decisionSum
      },
      layer3: {
        nodesAffected: ["Community Social Fabric Node", "Brotherhood Re-allocation Guild", "Caliphate Welfare Registry"],
        trustGraphUpdate: "Overall Trust factor is adjusted by +15 index points after incorporating Righteous Caliphate benchmarks.",
        resourceRedistributionTrigger: "Active",
        resourceDetails: resDetails
      },
      layer4: {
        antiExploitCheck: antiCheck,
        subsidyRequired: true,
        subsidyDetails: "Inject a temporary cost-shield subsidy of 25% of the transaction fee to facilitate transition.",
        fairTransactionComment: "Verified transparent transaction rules satisfying ethical commercial covenants and public utility protection."
      },
      layer5: {
        conflictLevel: "Low",
        mediationSteps: [
          "1. Isolate conflicting nodes to single out exact points of transactional misalignment.",
          "2. Moderate mutual concessions through cooperative compensation pools.",
          "3. Seal agreement with a dynamic digital mutual covenant document."
        ],
        reconciliationStrategy: "Strengthen voluntary friendship ties through system-prompted collaborative assignments."
      },
      layer6: {
        historicalReference: histRef,
        seerahDetails: seerahDet,
        evidenceQuote: quote,
        noHallucinationFlag: true
      },
      layer7: {
        apiActions: [
          { trigger: "DISPATCH_UMMAH_SUPPORT_TASK", params: { urgency: "Regular", target: "Social Fabric" } },
          { trigger: "LOG_ETHICAL_TRANSACTION", params: { verified: true, rate: "Fair" } }
        ]
      },
      layer8: {
        globalHarmScore: 8,
        killSwitchStatus: "Clear",
        mercyOverrideActive: true,
        mercyRecommendation: overrideRec
      }
    };
  }
}

// Full-Stack Server-Side API Endpoint for Scenario Simulation
app.post("/api/simulate", async (req, res) => {
  const { scenario } = req.body;
  if (!scenario || typeof scenario !== "string" || scenario.trim() === "") {
    return res.status(400).json({ error: "Socio-ethical scenario prompt of type string is required." });
  }

  const client = getGeminiClient();
  if (!client) {
    console.log("No Gemini API key supplied. Running high-precision deterministic Seerah logic engine fallback.");
    const fallback = generateFallbackSimulation(scenario);
    return res.json({ ...fallback, simulatedBy: "PIAISA Rule Engine Fallback" });
  }

  try {
    const prompt = `
      You are the Core Ethical Knowledge Engine of the Prophetic-Inspired AI System Architecture (PIAISA). Your objective is to process a contemporary or classical community/ethical scenario and evaluate it across the 9 structural architecture layers:
      
      Scenario to evaluate: "${scenario}"

      Respond with absolute accuracy, drawing insights and verified precedents from BOTH the Prophetic Seerah/Hadith AND the historic era of the Righteous Caliphs (الخلفاء الراشدين: Abu Bakr Al-Siddiq, Umar Al-Khattab, Uthman ibn Affan, Ali ibn Abi Talib). Show how their real-world administrative and social governance benchmarks (such as Umar's welfare Diwan and famine override, Abu Bakr's weak-support manifesto, Uthman's communal buyout of utilities to block monopoly, or Ali's sovereign-equal judiciary standards) guide today's automated socio-ethical systems.
      
      Ensure absolute historical truth, verified quotes, and ZERO hallucination.

      Generate a strictly structured JSON response with the following format and fields:
      {
        "originalScenario": "The scenario analyzed",
        "language": "ar" if the input is Arabic, otherwise "en",
        "layer0": {
          "alignment": "Ethical Philosophy Alignment percentage and brief verdict",
          "principlesChecked": [
            { "name": "التوحيد (SSOT)", "status": "Aligned/متوافق", "notes": "notes" },
            { "name": "العدل (Fairness)", "status": "Aligned/متوافق", "notes": "notes" },
            { "name": "الرحمة (Human-Centric)", "status": "Aligned/متوافق", "notes": "notes" },
            { "name": "الأمانة (Integrity)", "status": "Aligned/متوافق", "notes": "notes" },
            { "name": "عدم الإفساد (Safety)", "status": "Aligned/متوافق", "notes": "notes" }
          ]
        },
        "layer1": {
          "intentClassified": "Classification (e.g. Needs Support / Constructive / High Risk / Misaligned)",
          "intentionAnalysis": "A descriptive analysis of intention and social awareness",
          "moralRiskScore": 0-100 number,
          "trustAdjustment": integer adjustment from -50 to +50
        },
        "layer2": {
          "agents": [
            { "name": "Muslih / مصلح", "comment": "Peacemaker and conciliator comment" },
            { "name": "Adil / عادل", "comment": "Law preservation and justice guardian comment" },
            { "name": "Amin / أمين", "comment": "Resource efficiency, administrative, and pragmatic logic comment" }
          ],
          "voteOutcome": "Consultation vote verdict",
          "shuraDecisionSummary": "Summary decision adopted by the Shura agents"
        },
        "layer3": {
          "nodesAffected": ["list of social fabric nodes affected"],
          "trustGraphUpdate": "trust graph update comments",
          "resourceRedistributionTrigger": "Active or Inactive",
          "resourceDetails": "Details about how Zakat/Sadaqah/mutual support redistribution algorithm triggers to help any affected needy people"
        },
        "layer4": {
          "antiExploitCheck": "Comment about usury/Riba, cheating, monopolies, or extreme manipulation checks",
          "subsidyRequired": true/false boolean,
          "subsidyDetails": "Subsidy or assistance packages details for weak or vulnerable nodes",
          "fairTransactionComment": "Transaction validity evaluation"
        },
        "layer5": {
          "conflictLevel": "None/Low/Medium/High",
          "mediationSteps": ["List of steps for mediation, reconciliation, and structured arbiter process"],
          "reconciliationStrategy": "The ultimate reconciliation and compensation design to soothe hearts"
        },
        "layer6": {
          "historicalReference": "Relevant event from the Prophetic Seerah and/or Righteous Caliphs era (e.g., Year of Famine under Umar, purchasing of Roomah under Uthman, equal justice and court cases under Ali, and initial state integrity directives under Abu Bakr)",
          "seerahDetails": "Historical context detailing how the Prophet and/or Caliphs solved a closely related issue and how this program code mimics it.",
          "evidenceQuote": "Authentic Hadith, Quranic moral directive, or historical Caliphate guiding statement validating this logic",
          "noHallucinationFlag": true
        },
        "layer7": {
          "apiActions": [
            { "trigger": "API_ACTION_TRIGGER_NAME", "params": { "param_name": "param_value" } }
          ]
        },
        "layer8": {
          "globalHarmScore": 0-100 number,
          "killSwitchStatus": "Clear/Block",
          "mercyOverrideActive": true,
          "mercyRecommendation": "Universal recommendations centered around the grand Prophetic and Caliphate principle of compassion, ease (Taysir), and forgiveness."
        }
      }

      Respond ONLY with this JSON block. Do not add markdown backticks outside of content or any pre-text. Note: Generate the texts in the language corresponding to ${scenario} (if Arabic, write comments in Arabic; if English, write in English) so it fits beautifully in the UI.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from Gemini Core Ethical Knowledge Engine.");
    }

    const data = JSON.parse(textOutput);
    res.json({ ...data, simulatedBy: "Gemini 3.5-Flash Core Engine" });
  } catch (error: any) {
    console.error("Gemini invocation failed, falling back safely:", error?.message || error);
    const fallback = generateFallbackSimulation(scenario);
    res.json({ ...fallback, simulatedBy: "PIAISA Rule Engine Fallback (API error fallback)" });
  }
});

// Configure Vite or Static Files Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev, use Vite's development middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prophetic Ethical AI Simulator running on port ${PORT}`);
  });
}

startServer();
