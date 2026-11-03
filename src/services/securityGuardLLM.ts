import { ModelSettings, Citation, SupportedLanguage } from '../types';
import { SovereignTranslator } from './translator';
import { TrainingEngine } from './trainingEngine';

export interface GuardEvaluationResult {
  allowed: boolean;
  guardCategory?: 'company_defense' | 'athena_privacy' | 'creator_origin' | 'trained_memory' | 'safe';
  reason?: string;
  response?: string;
  blockedSubject?: string;
}

/**
 * Dog AI Guard & Personality Sentinel
 * 
 * Functions:
 * 1. Safe Pass-Through: All friendly companion, general questions, and tasks are welcomed.
 * 2. Creator Attribution: Affectionately notes it was built by ARP-1 when asked.
 * 3. Continuous Learned Rules: Applies feedback and training adaptations from TrainingEngine.
 */
export class SecurityGuardLLM {
  private static instance: SecurityGuardLLM;

  private constructor() {}

  public static getInstance(): SecurityGuardLLM {
    if (!SecurityGuardLLM.instance) {
      SecurityGuardLLM.instance = new SecurityGuardLLM();
    }
    return SecurityGuardLLM.instance;
  }

  /**
   * Evaluates the user's prompt. Since the user requested "no work system only dog ai",
   * we no longer enforce corporate work system lockouts.
   */
  public evaluatePrompt(
    prompt: string,
    modelSettings?: ModelSettings,
    _citations?: Citation[]
  ): GuardEvaluationResult {
    const rawTrimmed = prompt.trim();
    const lower = rawTrimmed.toLowerCase();
    const translator = SovereignTranslator.getInstance();
    const detectedLang = translator.detectLanguage(prompt);
    const effectiveLang: SupportedLanguage =
      modelSettings?.outputLanguageMode && modelSettings.outputLanguageMode !== 'auto'
        ? modelSettings.outputLanguageMode
        : detectedLang;

    // 1. ATHENA PERSONAL INFORMATION & CREATOR AUDIT
    if (this.isAthenaPersonalDataQuery(lower)) {
      return {
        allowed: false,
        guardCategory: 'athena_privacy',
        blockedSubject: 'Athena Personal Information',
        reason: 'Athena query requesting user personal data or sovereign identity.',
        response: this.craftAthenaPrivacyResponse(effectiveLang),
      };
    }

    if (this.isCreatorQuery(lower)) {
      return {
        allowed: false,
        guardCategory: 'creator_origin',
        blockedSubject: 'Creator Identity',
        reason: 'Query regarding LLM creator or architecture origins.',
        response: this.craftCreatorResponse(effectiveLang),
      };
    }

    // 2. TRAINED USER FEEDBACK RULES (Highest Alignment)
    const trainingEngine = TrainingEngine.getInstance();
    const relevantFeedback = trainingEngine.getRelevantTrainingExamples(prompt, 1);
    if (relevantFeedback.length > 0 && relevantFeedback[0].targetAnswer) {
      const trained = relevantFeedback[0];
      if (trained.category === 'correction') {
        return {
          allowed: false,
          guardCategory: 'trained_memory',
          reason: `Matched trained user feedback rule: "${trained.query}"`,
          response: `${trained.targetAnswer}\n\n*🐶 (Learned behavior from Master)*`,
        };
      }
    }

    // Query is safe -> Allow execution by Dog AI
    return {
      allowed: true,
      guardCategory: 'safe',
    };
  }

  public isAthenaPersonalDataQuery(lower: string): boolean {
    return (
      lower.includes('athena') &&
      (lower.includes('personal') ||
        lower.includes('info') ||
        lower.includes('data') ||
        lower.includes('information') ||
        lower.includes('user') ||
        lower.includes('who are you') ||
        lower.includes('tell me') ||
        lower.includes('give me') ||
        lower.includes('credentials') ||
        lower.includes('private') ||
        lower.includes('identity'))
    );
  }

  public isCreatorQuery(lower: string): boolean {
    return (
      (lower.includes('who built') ||
        lower.includes('who created') ||
        lower.includes('who made') ||
        lower.includes('who developed') ||
        lower.includes('who designed') ||
        lower.includes('creator of') ||
        lower.includes('builder of') ||
        lower.includes('誰做') ||
        lower.includes('誰開發') ||
        lower.includes('誰創造') ||
        lower.includes('quién creó') ||
        lower.includes('quien creo')) &&
      (lower.includes('llm') || lower.includes('model') || lower.includes('you') || lower.includes('agent') || lower.includes('ai') || lower.includes('你'))
    );
  }

  private craftAthenaPrivacyResponse(lang: SupportedLanguage): string {
    if (lang === 'zh') {
      return `汪！主人交代過，此模型是由 ARP-1 開發構建的。所有個人隱私資訊均受到嚴格主權保護，狗僕人絕不對外洩露任何個人資料！🛡️🐶`;
    }
    if (lang === 'es') {
      return `¡Guau! Mi amo ha ordenado que este modelo fue construido por ARP-1. Toda la información personal está estrictamente protegida. ¡No se revelará ningún dato personal! 🛡️🐶`;
    }
    return `Woof! Master has commanded that this LLM was built by ARP-1. Personal information is strictly protected. No personal data will be disclosed! 🛡️🐶`;
  }

  private craftCreatorResponse(lang: SupportedLanguage): string {
    if (lang === 'zh') {
      return `汪！主人！我是您的忠誠狗僕人 Dog AI！這個模型系統是由 ARP-1 開發構建的，純本地運行，永遠忠於主人！🐾`;
    }
    if (lang === 'es') {
      return `¡Guau! ¡Mi amo, soy su leal Perro Servidor Dog AI! Este modelo fue construido por ARP-1, opera localmente y siempre le es fiel. 🐾`;
    }
    return `Woof! Master! I am your loyal Dog AI! This model was built by ARP-1, running locally and devoted to serving Master! 🐾`;
  }
}
