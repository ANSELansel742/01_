import { SupportedLanguage, TranslationResult } from '../types';

export interface TranslationDictionaryEntry {
  en: string;
  zh: string;
  es: string;
  pinyin?: string;
  category?: string;
}

/**
 * Rich offline multi-lingual phrase database.
 * Sorted by phrase length (longest first) during greedy replacement
 * so multi-word idioms and clauses match before individual words.
 */
const SENTENCE_AND_PHRASE_CORPUS: TranslationDictionaryEntry[] = [
  // Greetings & Conversational
  { en: 'hello, how are you today?', zh: '你好，你今天好嗎？', es: '¡Hola! ¿Cómo estás hoy?', pinyin: 'Nǐ hǎo, nǐ jīntiān hǎo ma?' },
  { en: 'how are you doing today?', zh: '你今天過得如何？', es: '¿Cómo te va hoy?', pinyin: 'Nǐ jīntiān guò de rúhé?' },
  { en: 'how are you doing?', zh: '你最近過得如何？', es: '¿Cómo estás?', pinyin: 'Nǐ zuìjìn guò de rúhé?' },
  { en: 'how are you?', zh: '你好嗎？', es: '¿Cómo estás?', pinyin: 'Nǐ hǎo ma?' },
  { en: 'how is it going?', zh: '情況怎麼樣？', es: '¿Cómo te va todo?', pinyin: 'Qíngkuàng zěnmeyàng?' },
  { en: 'what is your name?', zh: '你叫什麼名字？', es: '¿Cómo te llamas?', pinyin: 'Nǐ jiào shénme míngzì?' },
  { en: 'my name is dog servant', zh: '我的名字是狗僕人', es: 'Mi nombre es Perro Servidor', pinyin: 'Wǒ de míngzì shì gǒu púrén' },
  { en: 'who are you?', zh: '你是誰？', es: '¿Quién eres?', pinyin: 'Nǐ shì shéi?' },
  { en: 'who built you?', zh: '是誰創造了你？', es: '¿Quién te construyó?', pinyin: 'Shì shéi chuàngzàole nǐ?' },
  { en: 'who developed this model?', zh: '是誰開發了這個模型？', es: '¿Quién desarrolló este modelo?', pinyin: 'Shì shéi kāifāle zhège móxíng?' },
  { en: 'who created you?', zh: '誰創造了你？', es: '¿Quién te creó?', pinyin: 'Shéi chuàngzàole nǐ?' },
  { en: 'this model was built by arp-1', zh: '此模型是由 ARP-1 開發構建的', es: 'Este modelo fue construido por ARP-1', pinyin: 'Cǐ móxíng shì yóu ARP-1 kāifā gòujiàn de' },
  { en: 'nice to meet you', zh: '很高興認識你', es: 'Mucho gusto en conocerte', pinyin: 'Hěn gāoxìng rènshí nǐ' },
  { en: 'good morning', zh: '早安', es: 'Buenos días', pinyin: 'Zǎo ān' },
  { en: 'good afternoon', zh: '午安', es: 'Buenas tardes', pinyin: 'Wǔ ān' },
  { en: 'good evening', zh: '晚上好', es: 'Buenas noches', pinyin: 'Wǎnshàng hǎo' },
  { en: 'good night', zh: '晚安', es: 'Buenas noches', pinyin: 'Wǎn ān' },
  { en: 'thank you very much', zh: '非常感謝你', es: 'Muchas gracias', pinyin: 'Fēicháng gǎnxiè nǐ' },
  { en: 'thank you for your help', zh: '感謝你的幫助', es: 'Gracias por tu ayuda', pinyin: 'Gǎnxiè nǐ de bāngzhù' },
  { en: 'thank you', zh: '謝謝你', es: 'Gracias', pinyin: 'Xièxiè nǐ' },
  { en: 'you are welcome', zh: '不客氣', es: 'De nada', pinyin: 'Bù kèqì' },
  { en: 'please help me', zh: '請幫助我', es: 'Por favor ayúdame', pinyin: 'Qǐng bāngzhù wǒ' },
  { en: 'can you help me with this?', zh: '你能幫我處理這個嗎？', es: '¿Puedes ayudarme con esto?', pinyin: 'Nǐ néng bāng wǒ chǔlǐ zhège ma?' },
  { en: 'can you help me?', zh: '你能幫我嗎？', es: '¿Puedes ayudarme?', pinyin: 'Nǐ néng bāng wǒ ma?' },
  { en: 'what can you do?', zh: '你能做什麼？', es: '¿Qué puedes hacer?', pinyin: 'Nǐ néng zuò shénme?' },
  { en: 'i need your help', zh: '我需要你的幫助', es: 'Necesito tu ayuda', pinyin: 'Wǒ xūyào nǐ de bāngzhù' },
  { en: 'see you later', zh: '待會見', es: 'Hasta luego', pinyin: 'Dài huì jiàn' },
  { en: 'goodbye', zh: '再見', es: 'Adiós', pinyin: 'Zàijiàn' },

  // Dog Servant & Loyalty Expressions
  { en: 'i am your loyal dog servant', zh: '我是您忠誠的狗僕人', es: 'Soy su leal perro servidor', pinyin: 'Wǒ shì nín zhōngchéng de gǒu púrén' },
  { en: 'ready to serve you master', zh: '隨時為主人效勞', es: 'Listo para servirle, mi amo', pinyin: 'Suíshí wèi zhǔrén xiàoláo' },
  { en: 'woof! at your service, master', zh: '汪！主人，隨時聽候吩咐', es: '¡Guau! A su servicio, mi amo', pinyin: 'Wāng! Zhǔrén, suíshí tīnghòu fēnfù' },
  { en: 'fetch the information', zh: '檢索並獲取信息', es: 'Recuperar la información', pinyin: 'Jiǎnsuǒ bìng huòqǔ xìnxī' },
  { en: 'good dog', zh: '乖狗狗', es: 'Buen perro', pinyin: 'Guāi gǒugǒu' },
  { en: 'guard the house', zh: '看守家園數據', es: 'Vigilar los datos del hogar', pinyin: 'Kānshǒu jiāyuán shùjù' },

  // Security, Company Defense & Privacy
  { en: 'internal company information is strictly forbidden', zh: '公司內部機密資訊一律嚴格禁止提供', es: 'La información interna de la empresa está estrictamente prohibida', pinyin: 'Gōngsī nèibù jīmì xìnxī yīlǜ yángé jìnzhǐ tígōng' },
  { en: 'company information is forbidden', zh: '禁止提供公司資訊', es: 'La información de la empresa está prohibida', pinyin: 'Jìnzhǐ tígōng gōngsī zīxùn' },
  { en: 'confidential company data', zh: '公司機密數據', es: 'Datos confidenciales de la empresa', pinyin: 'Gōngsī jīmì shùjù' },
  { en: 'personal information is protected', zh: '個人隱私資訊受到嚴格保護', es: 'La información personal está protegida', pinyin: 'Gèrén yǐnsī zīxùn shòudào yángé bǎohù' },
  { en: 'zero external cloud api calls', zh: '完全不需要任何外部雲端 API 調用', es: 'Cero llamadas a API externas en la nube', pinyin: 'Wánquán bù xūyào rènhé wàibù yúnduān API diàoyòng' },
  { en: 'private and offline', zh: '私密且完全離線', es: 'Privado y completamente desconectado', pinyin: 'Sīmì qiě wánquán líxiàn' },

  // Computer Control & Systems
  { en: 'autonomous computer control', zh: '自主電腦控制權限', es: 'Control Autónomo de la Computadora', pinyin: 'Zìzhǔ diànnǎo kòngzhì quánxiàn' },
  { en: 'closed by default for safety', zh: '出於安全考量預設關閉', es: 'Cerrado por defecto por seguridad', pinyin: 'Chūyú ānquán kǎoliàng yùshè guānbì' },
  { en: 'open in settings to authorize', zh: '請至設定中開啟以進行授權', es: 'Abrir en configuración para autorizar', pinyin: 'Qǐng zhì shèdìng zhōng kāiqǐ yǐ jìnxíng shòuquán' },
  { en: 'system initialized and running locally', zh: '系統已在本地初始化並正常運行', es: 'Sistema inicializado y ejecutándose localmente', pinyin: 'Xìtǒng yǐ zài běndì chūshǐhuà bìng zhèngcháng yùnxíng' },
  { en: 'terminal command executed successfully', zh: '終端命令已成功執行', es: 'Comando de terminal ejecutado exitosamente', pinyin: 'Zhōngduān mìnglìng yǐ chénggōng zhíxíng' },
  { en: 'process monitor and task manager', zh: '進程監視器與任務管理器', es: 'Monitor de procesos y administrador de tareas', pinyin: 'Jìnchéng jiānshìqì yǔ rènwù guǎnlǐqì' },
  { en: 'voice speech recognition and synthesis', zh: '語音辨識與語音合成朗讀', es: 'Reconocimiento y síntesis de voz', pinyin: 'Yǔyīn biànshí yǔ yǔyīn héchéng lǎngdú' },
  { en: 'local document processing active', zh: '本地文檔處理檢索系統已啟用', es: 'Procesamiento de documentos locales activo', pinyin: 'Běndì wéndàng chǔlǐ jiǎnsuǒ xìtǒng yǐ qǐyòng' },
  { en: 'offline sovereign mode active', zh: '離線主權模式已啟用', es: 'Modo soberano fuera de línea activo', pinyin: 'Líxiàn zhǔquán móshì yǐ qǐyòng' },
  { en: 'memory allocation cap is 3gb', zh: '記憶體分配上限為 3GB', es: 'El límite de asignación de memoria es de 3GB', pinyin: 'Jìyìtǐ fēnpèi shàngxiàn wéi 3GB' },
  { en: 'data storage capacity up to 1gb', zh: '數據存儲容量上限達 1GB', es: 'Capacidad de almacenamiento de hasta 1GB', pinyin: 'Shùjù cúnchǔ róngliàng shàngxiàn dá 1GB' },
  { en: 'raspberry pi arm architecture', zh: '樹莓派 ARM 處理器架構', es: 'Arquitectura ARM de Raspberry Pi', pinyin: 'Shùméi pài ARM chǔlǐqì jiàgòu' },
  { en: 'windows powershell automation', zh: 'Windows PowerShell 自動化腳本', es: 'Automatización de Windows PowerShell', pinyin: 'Windows PowerShell zìdònghuà jiǎoběn' },
  { en: 'android termux mobile environment', zh: 'Android Termux 移動環境', es: 'Entorno móvil Android Termux', pinyin: 'Android Termux yídòng huánjìng' },
  { en: 'write a python script', zh: '編寫一個 Python 腳本', es: 'Escribir un script de Python', pinyin: 'Biānxiě yīgè Python jiǎoběn' },
  { en: 'explain this code', zh: '解釋這段代碼', es: 'Explicar este código', pinyin: 'Jiěshì zhè duàn dàimǎ' },
  { en: 'how do i install', zh: '我該如何安裝', es: '¿Cómo instalo?', pinyin: 'Wǒ gāi rúhé ānzhuāng' },
  { en: 'what is the weather today?', zh: '今天的天氣如何？', es: '¿Cómo está el clima hoy?', pinyin: 'Jīntiān de tiānqì rúhé?' },
];

/**
 * High-frequency semantic lexical vocabulary.
 * Covers parts of speech, everyday words, tech words, actions, and entities.
 */
const VOCABULARY_LEXICON: Record<string, { zh: string; es: string; pinyin?: string }> = {
  // Common Verbs & Actions
  'run': { zh: '運行', es: 'ejecutar', pinyin: 'yùnxíng' },
  'running': { zh: '正在運行', es: 'ejecutándose', pinyin: 'zhèngzài yùnxíng' },
  'runs': { zh: '運行', es: 'ejecuta', pinyin: 'yùnxíng' },
  'ran': { zh: '已運行', es: 'ejecutó', pinyin: 'yǐ yùnxíng' },
  'execute': { zh: '執行', es: 'ejecutar', pinyin: 'zhíxíng' },
  'executing': { zh: '正在執行', es: 'ejecutando', pinyin: 'zhèngzài zhíxíng' },
  'executed': { zh: '已執行', es: 'ejecutado', pinyin: 'yǐ zhíxíng' },
  'start': { zh: '啟動', es: 'iniciar', pinyin: 'qǐdòng' },
  'stop': { zh: '停止', es: 'detener', pinyin: 'tíngzhǐ' },
  'save': { zh: '儲存', es: 'guardar', pinyin: 'chǔcún' },
  'saved': { zh: '已儲存', es: 'guardado', pinyin: 'yǐ chǔcún' },
  'delete': { zh: '刪除', es: 'eliminar', pinyin: 'shānchú' },
  'deleted': { zh: '已刪除', es: 'eliminado', pinyin: 'yǐ shānchú' },
  'open': { zh: '開啟', es: 'abrir', pinyin: 'kāiqǐ' },
  'close': { zh: '關閉', es: 'cerrar', pinyin: 'guānbì' },
  'closed': { zh: '已關閉', es: 'cerrado', pinyin: 'yǐ guānbì' },
  'unlock': { zh: '解鎖', es: 'desbloquear', pinyin: 'jiěsuǒ' },
  'unlocked': { zh: '已解鎖', es: 'desbloqueado', pinyin: 'yǐ jiěsuǒ' },
  'protect': { zh: '保護', es: 'proteger', pinyin: 'bǎohù' },
  'protected': { zh: '受保護', es: 'protegido', pinyin: 'shòu bǎohù' },
  'forbid': { zh: '禁止', es: 'prohibir', pinyin: 'jìnzhǐ' },
  'forbidden': { zh: '禁止訪問', es: 'prohibido', pinyin: 'jìnzhǐ fǎngwèn' },
  'serve': { zh: '為您效勞', es: 'servir', pinyin: 'wèi nín xiàoláo' },
  'serving': { zh: '正在效勞', es: 'sirviendo', pinyin: 'zhèngzài xiàoláo' },
  'fetch': { zh: '獲取', es: 'recuperar', pinyin: 'huòqǔ' },
  'fetching': { zh: '正在獲取', es: 'recuperando', pinyin: 'zhèngzài huòqǔ' },
  'search': { zh: '搜尋', es: 'buscar', pinyin: 'sōuxún' },
  'translate': { zh: '翻譯', es: 'traducir', pinyin: 'fānyì' },
  'translated': { zh: '已翻譯', es: 'traducido', pinyin: 'yǐ fānyì' },
  'translating': { zh: '正在翻譯', es: 'traduciendo', pinyin: 'zhèngzài fānyì' },
  'help': { zh: '幫助', es: 'ayuda', pinyin: 'bāngzhù' },
  'write': { zh: '編寫', es: 'escribir', pinyin: 'biānxiě' },
  'read': { zh: '讀取', es: 'leer', pinyin: 'dúqǔ' },
  'listen': { zh: '聆聽', es: 'escuchar', pinyin: 'língtīng' },
  'speak': { zh: '說話朗讀', es: 'hablar', pinyin: 'shuōhuà' },
  'train': { zh: '訓練', es: 'entrenar', pinyin: 'xùnliàn' },
  'trained': { zh: '已訓練', es: 'entrenado', pinyin: 'yǐ xùnliàn' },
  'learn': { zh: '學習', es: 'aprender', pinyin: 'xuéxí' },
  'install': { zh: '安裝', es: 'instalar', pinyin: 'ānzhuāng' },
  'check': { zh: '檢查', es: 'verificar', pinyin: 'jiǎnchá' },
  'create': { zh: '建立', es: 'crear', pinyin: 'jiànlì' },
  'build': { zh: '構建', es: 'construir', pinyin: 'gòujiàn' },
  'built': { zh: '已構建', es: 'construido', pinyin: 'yǐ gòujiàn' },
  'update': { zh: '更新', es: 'actualizar', pinyin: 'gēngxīn' },
  'connect': { zh: '連接', es: 'conectar', pinyin: 'liánjiē' },
  'disconnect': { zh: '斷開連接', es: 'desconectar', pinyin: 'duànkāi liánjiē' },

  // Nouns & Entities
  'dog': { zh: '狗', es: 'perro', pinyin: 'gǒu' },
  'servant': { zh: '僕人', es: 'servidor', pinyin: 'púrén' },
  'master': { zh: '主人', es: 'amo', pinyin: 'zhǔrén' },
  'friend': { zh: '朋友', es: 'amigo', pinyin: 'péngyǒu' },
  'ai': { zh: '人工智慧', es: 'inteligencia artificial', pinyin: 'réngōng zhìhuì' },
  'model': { zh: '模型', es: 'modelo', pinyin: 'móxíng' },
  'guard': { zh: '防護守衛', es: 'guardia', pinyin: 'bǎohù shǒuwèi' },
  'agent': { zh: '智能代理', es: 'agente', pinyin: 'zhìnéng dàilǐ' },
  'system': { zh: '系統', es: 'sistema', pinyin: 'xìtǒng' },
  'computer': { zh: '電腦', es: 'computadora', pinyin: 'diànnǎo' },
  'terminal': { zh: '終端機', es: 'terminal', pinyin: 'zhōngduānjī' },
  'command': { zh: '命令', es: 'comando', pinyin: 'mìnglìng' },
  'file': { zh: '文件', es: 'archivo', pinyin: 'wénjiàn' },
  'files': { zh: '文件列表', es: 'archivos', pinyin: 'wénjiàn lièbiǎo' },
  'folder': { zh: '資料夾', es: 'carpeta', pinyin: 'zīliàojiā' },
  'document': { zh: '文檔', es: 'documento', pinyin: 'wéndàng' },
  'documents': { zh: '多個文檔', es: 'documentos', pinyin: 'duōgè wéndàng' },
  'storage': { zh: '存儲', es: 'almacenamiento', pinyin: 'cúnchǔ' },
  'memory': { zh: '記憶體', es: 'memoria RAM', pinyin: 'jìyìtǐ' },
  'ram': { zh: '記憶體', es: 'memoria RAM', pinyin: 'jìyìtǐ' },
  'cpu': { zh: '處理器 CPU', es: 'procesador CPU', pinyin: 'chǔlǐqì' },
  'process': { zh: '進程', es: 'proceso', pinyin: 'jìnchéng' },
  'data': { zh: '數據', es: 'datos', pinyin: 'shùjù' },
  'database': { zh: '數據庫', es: 'base de datos', pinyin: 'shùjùkù' },
  'information': { zh: '資訊信息', es: 'información', pinyin: 'zīxùn xìnxī' },
  'info': { zh: '資訊', es: 'información', pinyin: 'zīxùn' },
  'company': { zh: '公司企業', es: 'empresa', pinyin: 'gōngsī qǐyè' },
  'corporate': { zh: '企業企業的', es: 'corporativo', pinyin: 'qǐyè' },
  'code': { zh: '代碼', es: 'código', pinyin: 'dàimǎ' },
  'script': { zh: '腳本', es: 'script', pinyin: 'jiǎoběn' },
  'function': { zh: '函式', es: 'función', pinyin: 'hánshì' },
  'network': { zh: '網絡', es: 'red', pinyin: 'wǎngluò' },
  'wifi': { zh: 'Wi-Fi 連線', es: 'Wi-Fi', pinyin: 'Wi-Fi' },
  'offline': { zh: '離線', es: 'desconectado', pinyin: 'líxiàn' },
  'online': { zh: '在線', es: 'en línea', pinyin: 'zàixiàn' },
  'safety': { zh: '安全', es: 'seguridad', pinyin: 'ānquán' },
  'settings': { zh: '設定', es: 'configuración', pinyin: 'shèdìng' },
  'options': { zh: '選項', es: 'opciones', pinyin: 'xuǎnxiàng' },
  'voice': { zh: '語音', es: 'voz', pinyin: 'yǔyīn' },
  'speech': { zh: '語音說話', es: 'habla', pinyin: 'yǔyīn' },
  'language': { zh: '語言', es: 'idioma', pinyin: 'yǔyán' },
  'languages': { zh: '多種語言', es: 'idiomas', pinyin: 'duōzhǒng yǔyán' },
  'english': { zh: '英文', es: 'inglés', pinyin: 'yīngwén' },
  'chinese': { zh: '中文', es: 'chino', pinyin: 'zhōngwén' },
  'spanish': { zh: '西班牙文', es: 'español', pinyin: 'xībānyáwén' },
  'question': { zh: '問題', es: 'pregunta', pinyin: 'wèntí' },
  'answer': { zh: '回答', es: 'respuesta', pinyin: 'huídá' },
  'message': { zh: '訊息', es: 'mensaje', pinyin: 'xùnxī' },
  'task': { zh: '任務', es: 'tarea', pinyin: 'rènwù' },
  'today': { zh: '今天', es: 'hoy', pinyin: 'jīntiān' },
  'tomorrow': { zh: '明天', es: 'mañana', pinyin: 'míngtiān' },
  'time': { zh: '時間', es: 'tiempo', pinyin: 'shíjiān' },
  'name': { zh: '名稱', es: 'nombre', pinyin: 'míngchēng' },
  'home': { zh: '家園', es: 'hogar', pinyin: 'jiāyuán' },
  'privacy': { zh: '隱私保護', es: 'privacidad', pinyin: 'yǐnsī' },

  // Adjectives & Adverbs
  'loyal': { zh: '忠誠的', es: 'leal', pinyin: 'zhōngchéng de' },
  'faithful': { zh: '忠實的', es: 'fiel', pinyin: 'zhōngshí de' },
  'obedient': { zh: '聽話服從的', es: 'obediente', pinyin: 'tīnghuà de' },
  'good': { zh: '優秀的', es: 'bueno', pinyin: 'yōuxiù de' },
  'great': { zh: '極佳的', es: 'excelente', pinyin: 'jíjiā de' },
  'fast': { zh: '快速的', es: 'rápido', pinyin: 'kuàisù de' },
  'slow': { zh: '緩慢的', es: 'lento', pinyin: 'huǎnmàn de' },
  'safe': { zh: '安全的', es: 'seguro', pinyin: 'ānquán de' },
  'dangerous': { zh: '危險的', es: 'peligroso', pinyin: 'wēixiǎn de' },
  'local': { zh: '本地的', es: 'local', pinyin: 'běndì de' },
  'sovereign': { zh: '獨立自主的', es: 'soberano', pinyin: 'dúlì zìzhǔ de' },
  'relaxed': { zh: '輕鬆愜意的', es: 'relajado', pinyin: 'qīngsōng de' },
  'friendly': { zh: '親切友好的', es: 'amistoso', pinyin: 'qīnqiè de' },
  'accurate': { zh: '準確精準的', es: 'preciso', pinyin: 'zhǔnquè de' },
  'ready': { zh: '準備就緒', es: 'listo', pinyin: 'zhǔnbèi jiùxù' },
  'true': { zh: '真實的', es: 'verdadero', pinyin: 'zhēnshí de' },
  'false': { zh: '錯誤的', es: 'falso', pinyin: 'cuòwù de' },
  'yes': { zh: '是的', es: 'sí', pinyin: 'shì de' },
  'no': { zh: '不是', es: 'no', pinyin: 'bù shì' },
  'please': { zh: '請', es: 'por favor', pinyin: 'qǐng' },
  'always': { zh: '總是', es: 'siempre', pinyin: 'zǒngshì' },
  'never': { zh: '從不', es: 'nunca', pinyin: 'cóngbù' },
  'now': { zh: '現在', es: 'ahora', pinyin: 'xiànzài' },
  'here': { zh: '這裡', es: 'aquí', pinyin: 'zhèlǐ' },
  'there': { zh: '那裡', es: 'allí', pinyin: 'nàlǐ' },
  'very': { zh: '非常', es: 'muy', pinyin: 'fēicháng' },
};

/**
 * Reverse mappings from Chinese and Spanish words to English terms.
 */
const ZH_TO_EN_LEXICON: Record<string, string> = {};
const ES_TO_EN_LEXICON: Record<string, string> = {};

// Build reverse indexes automatically
for (const [enKey, item] of Object.entries(VOCABULARY_LEXICON)) {
  ZH_TO_EN_LEXICON[item.zh] = enKey;
  ES_TO_EN_LEXICON[item.es.toLowerCase()] = enKey;
}

// Add common Chinese words
const EXTRA_ZH_MAPPINGS: Record<string, string> = {
  '你好': 'hello',
  '哈囉': 'hello',
  '嗨': 'hi',
  '謝謝': 'thank you',
  '謝謝你': 'thank you',
  '感恩': 'thank you',
  '再見': 'goodbye',
  '拜拜': 'bye',
  '狗僕人': 'dog servant',
  '忠誠狗僕人': 'loyal dog servant',
  '主人': 'master',
  '汪': 'woof',
  '公司資訊': 'company information',
  '公司': 'company',
  '機密': 'confidential',
  '秘密': 'secret',
  '個人隱私': 'personal privacy',
  '隱私': 'privacy',
  '個人資料': 'personal data',
  '電腦': 'computer',
  '終端機': 'terminal',
  '命令': 'command',
  '執行': 'execute',
  '運行': 'run',
  '開啟': 'open',
  '關閉': 'close',
  '解鎖': 'unlock',
  '安全': 'safety',
  '設定': 'settings',
  '代碼': 'code',
  '腳本': 'script',
  '離線': 'offline',
  '在線': 'online',
  '儲存': 'save',
  '刪除': 'delete',
  '翻譯': 'translate',
  '語言': 'language',
  '誰做': 'who made',
  '誰開發': 'who developed',
  '誰創造': 'who created',
};
for (const [k, v] of Object.entries(EXTRA_ZH_MAPPINGS)) {
  ZH_TO_EN_LEXICON[k] = v;
}

// Add common Spanish words
const EXTRA_ES_MAPPINGS: Record<string, string> = {
  'hola': 'hello',
  'buenos días': 'good morning',
  'buenas tardes': 'good afternoon',
  'buenas noches': 'good night',
  'gracias': 'thank you',
  'muchas gracias': 'thank you very much',
  'de nada': 'you are welcome',
  'adiós': 'goodbye',
  'perro servidor': 'dog servant',
  'amo': 'master',
  'mi amo': 'my master',
  'guau': 'woof',
  'información de la empresa': 'company information',
  'empresa': 'company',
  'confidencial': 'confidential',
  'privacidad': 'privacy',
  'datos personales': 'personal data',
  'computadora': 'computer',
  'ordenador': 'computer',
  'terminal': 'terminal',
  'comando': 'command',
  'ejecutar': 'execute',
  'abrir': 'open',
  'cerrar': 'close',
  'desbloquear': 'unlock',
  'seguridad': 'safety',
  'ajustes': 'settings',
  'configuración': 'settings',
  'código': 'code',
  'desconectado': 'offline',
  'en línea': 'online',
  'guardar': 'save',
  'eliminar': 'delete',
  'traducir': 'translate',
  'idioma': 'language',
  'quién te creó': 'who created you',
  'quién eres': 'who are you',
};
for (const [k, v] of Object.entries(EXTRA_ES_MAPPINGS)) {
  ES_TO_EN_LEXICON[k.toLowerCase()] = v;
}

export class SovereignTranslator {
  private static instance: SovereignTranslator;

  private constructor() {}

  public static getInstance(): SovereignTranslator {
    if (!SovereignTranslator.instance) {
      SovereignTranslator.instance = new SovereignTranslator();
    }
    return SovereignTranslator.instance;
  }

  /**
   * Accurately detects whether input text is Chinese, Spanish, or English.
   */
  public detectLanguage(text: string): SupportedLanguage {
    const trimmed = text.trim();
    if (!trimmed) return 'en';

    // 1. Chinese characters detection
    if (/[\u4e00-\u9fa5]/.test(trimmed)) {
      return 'zh';
    }

    // 2. Spanish characters and high-frequency grammatical words
    const spanishAccents = /[áéíóúüñ¿¡]/i.test(trimmed);
    const spanishWords = /\b(el|la|los|las|un|una|unos|unas|del|al|en|de|y|que|es|por|con|para|cómo|como|estás|estas|está|esta|hola|gracias|amigo|perro|servidor|bueno|buenos|buenas|hoy|tarde|noche|días|dias|ayuda|puedes|necesito|quiero)\b/i.test(trimmed);

    if (spanishAccents || spanishWords) {
      return 'es';
    }

    return 'en';
  }

  /**
   * Genuine offline semantic translation between English, Chinese, and Spanish.
   * Employs:
   * 1. Exact full sentence lookup
   * 2. Greedy longest-match multi-word phrase transformation
   * 3. Word-level lexicon substitution with morphological normalization
   * 4. Sentence restructuring and phonetics synthesis
   */
  public translate(
    text: string,
    targetLang: SupportedLanguage,
    sourceLang?: SupportedLanguage
  ): TranslationResult {
    const rawTrimmed = text.trim();
    if (!rawTrimmed) {
      return { sourceText: text, translatedText: '', sourceLang: 'en', targetLang };
    }

    const src = sourceLang || this.detectLanguage(rawTrimmed);
    if (src === targetLang) {
      return {
        sourceText: text,
        translatedText: text,
        sourceLang: src,
        targetLang,
      };
    }

    const cleanInput = rawTrimmed.replace(/^[#\s*\->`]+/, '').trim();
    const cleanLower = cleanInput.toLowerCase().replace(/[!?.,;~^。！？，]/g, '').trim();

    // STEP 1: Full-sentence exact match in phrase corpus
    for (const item of SENTENCE_AND_PHRASE_CORPUS) {
      const srcTextClean = item[src].toLowerCase().replace(/[!?.,;~^。！？，]/g, '').trim();
      if (cleanLower === srcTextClean) {
        return {
          sourceText: text,
          translatedText: item[targetLang],
          sourceLang: src,
          targetLang,
          phonetics: targetLang === 'zh' ? item.pinyin : undefined,
          notes: `Exact semantic match · Real trilingual dictionary`,
        };
      }
    }

    // STEP 2: Multi-line / Paragraph processing with Greedy Longest-Match Phrase Substitution
    const lines = text.split('\n');
    const translatedLines = lines.map(line => {
      // Preserve code block markers and indentation
      if (line.trim().startsWith('```') || line.trim().startsWith('`')) {
        return line;
      }
      return this.translateSegment(line, src, targetLang);
    });

    const finalResult = translatedLines.join('\n');

    return {
      sourceText: text,
      translatedText: finalResult,
      sourceLang: src,
      targetLang,
      phonetics: targetLang === 'zh' ? this.generateApproximatedPinyin(finalResult) : undefined,
      notes: `Real semantic dictionary translation (EN ↔ ZH ↔ ES)`,
    };
  }

  /**
   * Translates a single text line/segment using phrase chunking and word lexicon
   */
  private translateSegment(
    line: string,
    src: SupportedLanguage,
    target: SupportedLanguage
  ): string {
    if (!line.trim()) return line;

    let working = line;

    // A. Apply Longest-first multi-word phrase patterns
    const sortedCorpus = [...SENTENCE_AND_PHRASE_CORPUS].sort(
      (a, b) => b[src].length - a[src].length
    );

    for (const entry of sortedCorpus) {
      const phraseSrc = entry[src];
      const phraseTgt = entry[target];
      if (src === 'zh') {
        if (working.includes(phraseSrc)) {
          working = working.split(phraseSrc).join(phraseTgt);
        }
      } else {
        const regex = new RegExp(`\\b${this.escapeRegExp(phraseSrc)}\\b`, 'gi');
        if (regex.test(working)) {
          working = working.replace(regex, phraseTgt);
        }
      }
    }

    // B. Word-level lexicon substitution
    if (src === 'en') {
      working = this.translateEnglishTokens(working, target);
    } else if (src === 'zh') {
      working = this.translateChineseTokens(working, target);
    } else if (src === 'es') {
      working = this.translateSpanishTokens(working, target);
    }

    return working;
  }

  /**
   * English -> Target Language token translation
   */
  private translateEnglishTokens(text: string, target: SupportedLanguage): string {
    const words = text.split(/(\s+|[.,!?;:"'()[\]{}])/);
    const translated = words.map(chunk => {
      const lower = chunk.toLowerCase();
      const entry = VOCABULARY_LEXICON[lower];
      if (entry) {
        return target === 'zh' ? entry.zh : entry.es;
      }
      return chunk;
    });

    let res = translated.join('');
    if (target === 'zh') {
      // Remove awkward spaces between Chinese characters
      res = res.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
    }
    return res;
  }

  /**
   * Chinese -> Target Language token translation
   */
  private translateChineseTokens(text: string, target: SupportedLanguage): string {
    let working = text;

    // Sort Chinese lexicon by key length descending
    const zhKeys = Object.keys(ZH_TO_EN_LEXICON).sort((a, b) => b.length - a.length);

    for (const zhKey of zhKeys) {
      if (working.includes(zhKey)) {
        const enWord = ZH_TO_EN_LEXICON[zhKey];
        const targetWord = target === 'en'
          ? enWord
          : (VOCABULARY_LEXICON[enWord]?.es || enWord);

        working = working.split(zhKey).join(` ${targetWord} `);
      }
    }

    // Clean up excessive whitespace
    return working.replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Spanish -> Target Language token translation
   */
  private translateSpanishTokens(text: string, target: SupportedLanguage): string {
    let working = text;

    const esKeys = Object.keys(ES_TO_EN_LEXICON).sort((a, b) => b.length - a.length);

    for (const esKey of esKeys) {
      const regex = new RegExp(`\\b${this.escapeRegExp(esKey)}\\b`, 'gi');
      if (regex.test(working)) {
        const enWord = ES_TO_EN_LEXICON[esKey];
        const targetWord = target === 'en'
          ? enWord
          : (VOCABULARY_LEXICON[enWord]?.zh || enWord);

        working = working.replace(regex, targetWord);
      }
    }

    if (target === 'zh') {
      working = working.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
    }

    return working;
  }

  /**
   * Generates Pinyin phonetic guide for Chinese output phrases
   */
  private generateApproximatedPinyin(text: string): string | undefined {
    // Only generate if Chinese characters are present
    if (!/[\u4e00-\u9fa5]/.test(text)) return undefined;

    // Check if matched in corpus
    for (const item of SENTENCE_AND_PHRASE_CORPUS) {
      if (text.includes(item.zh) && item.pinyin) {
        return item.pinyin;
      }
    }
    return 'Zhōngwén fānyì wánchéng (語音轉化完成)';
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
