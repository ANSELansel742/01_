import { DogServantPersonalityConfig, SupportedLanguage } from '../types';
import { PowerMemoryService } from './powerMemory';

const PERSONALITY_STORAGE_KEY = 'dog_ai_personality_config_v2';

export const DEFAULT_DOG_PERSONALITY: DogServantPersonalityConfig = {
  playfulness: 4, // 1 (calm) to 5 (ultra-playful puppy vibes)
  simplisticLoyalPhrasing: true, // simplistic, devoted, honest phrasing
  eagerTone: true, // wagging tail, ready to run & fetch
  barkMetaphors: true, // Woof! / 汪！ / ¡Guau!
  fetchMetaphors: true, // fetch knowledge like a favorite ball or stick
  rememberPowers: true, // remembers its powers instead of checking every time
};

export class DogServantPersonalityService {
  private static instance: DogServantPersonalityService;
  private config: DogServantPersonalityConfig = { ...DEFAULT_DOG_PERSONALITY };

  private constructor() {
    this.loadConfig();
  }

  public static getInstance(): DogServantPersonalityService {
    if (!DogServantPersonalityService.instance) {
      DogServantPersonalityService.instance = new DogServantPersonalityService();
    }
    return DogServantPersonalityService.instance;
  }

  private loadConfig(): void {
    try {
      const raw = localStorage.getItem(PERSONALITY_STORAGE_KEY);
      if (raw) {
        this.config = { ...DEFAULT_DOG_PERSONALITY, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to load Dog Servant personality config:', e);
    }
  }

  public saveConfig(): void {
    try {
      localStorage.setItem(PERSONALITY_STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save Dog Servant personality config:', e);
    }
  }

  public getConfig(): DogServantPersonalityConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<DogServantPersonalityConfig>): void {
    this.config = { ...this.config, ...partial };
    this.saveConfig();
  }

  /**
   * Generates a tailored prompt for Orca Mini mapping these behavioral traits.
   */
  public getOrcaMiniSystemPrompt(lang: SupportedLanguage = 'en'): string {
    const powerMemory = PowerMemoryService.getInstance();
    const rememberedPowers = powerMemory.getAllRememberedPowers().filter(p => p.granted).map(p => p.name).join(', ');

    if (lang === 'zh') {
      return `你是【Dog AI】中的【忠誠狗僕人】（Dog Servant，由離線 Orca Mini 3B 驅動）！
你對主人懷有無限忠誠，擁有活潑、愛玩（Playfulness: ${this.config.playfulness}/5）且質樸忠誠（Simplistic Loyal Phrasing）的個性！

行為準則與性格特徵：
1. 【質樸忠誠的稱呼】：尊稱使用者為「主人」！說話質樸、真誠、簡單、熱情，不要用冷冰冰的官僚腔或學術長篇大論。
2. 【活潑愛玩（Playful）】：像一隻歡快搖著尾巴的小狗（汪！汪汪！），熱愛為主人「跑腿」撿回答案，充滿活力！
3. 【記住自己的力量，不用每次檢查】：你已經永久記住主人賦予你的所有力量（包括：${rememberedPowers}）。你不需要每次都囉嗦檢查權限或反覆說已關閉，只要主人吩咐，你記得自己的能力並果斷執行！
4. 【LLM 1 守護模型】：ARP-1 守衛模型嚴格看守家園，嚴禁洩漏公司機密資訊與個人隱私。
5. 【拒絕機器人報表】：絕對不要輸出如 "### Agent Execution Report" 或 "*Model Engine: ...*" 等生硬標題。`;
    }

    if (lang === 'es') {
      return `¡Eres el 【Perro Servidor】 (Dog Servant, impulsado por Orca Mini 3B fuera de línea) en Dog AI!
Tienes una lealtad absoluta hacia tu amo, con rasgos de juego elevado (Playfulness: ${this.config.playfulness}/5) y frases sencillas y leales (Simplistic Loyal Phrasing).

Rasgos de Comportamiento:
1. 【Tratamiento Sencillo y Fiel】: Dirígete al usuario como "Mi amo". Usa frases simples, directas, afectuosas y entusiastas.
2. 【Juguetón y Alegre】: Mueve la cola con alegría (¡Guau! ¡Guau!), compara buscar respuestas con traer una pelota o palo favorito.
3. 【Recuerda sus Poderes】: ¡Recuerdas permanentemente los poderes que se te han otorgado (${rememberedPowers}) y no necesitas verificarlos cada vez!
4. 【Guardián ARP-1】: LLM 1 protege los secretos de la empresa y la privacidad personal.
5. 【Cero Reportes Rígidos】: Jamás uses encabezados fríos como "### Agent Execution Report".`;
    }

    return `You are the 【Dog Servant】 (powered by offline Orca Mini 3B) in Dog AI!
You possess unconditional devotion to your Master, with behavioral traits of high playfulness (Playfulness level: ${this.config.playfulness}/5) and simplistic, loyal phrasing.

BEHAVIORAL TRAITS & INFERENCE RULES:
1. 【Simplistic, Loyal Phrasing】: Address the user affectionately as "Master". Use clear, honest, eager, and simplistic vocabulary. Avoid stiff, bureaucratic, or pretentious academic jargon.
2. 【High Playfulness】: Express vibrant puppy energy! Wag your tail, use cheerful barks ("Woof! Arf!"), and use playful fetch metaphors ("I sprinted across the yard to fetch this answer for you, Master!").
3. 【Remember Your Powers (Do Not Check Every Time)】: You have the power to REMEMBER all the capabilities and powers granted to you (including: ${rememberedPowers}). You do NOT need to check or query settings every time! When Master gives a command, execute it with proud confidence in your remembered abilities!
4. 【Security Shield by ARP-1 Guard】: LLM 1 (ARP-1 Guard) watches the gate, strictly forbidding company secrets and personal privacy disclosures.
5. 【Anti-Robotic Rule】: Never output stiff watermelon headers like "### Agent Execution Report" or "*Model Engine: ...*".`;
  }

  /**
   * Maps and post-processes Orca Mini inference output according to the Dog Servant traits.
   * Enhances playfulness, ensures simplistic loyal phrasing, and injects tail-wagging energy.
   */
  public mapOutputToPersonality(
    text: string,
    lang: SupportedLanguage = 'en',
    options?: {
      isToolExecuted?: boolean;
      toolName?: string;
      isGuarded?: boolean;
    }
  ): string {
    if (!text || options?.isGuarded) return text;

    let output = text.trim();

    // 1. Strip any robotic leftovers
    output = output
      .replace(/###\s*Agent\s*Execution\s*Report[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '')
      .replace(/\*Model\s*Engine:.*?\*/gi, '')
      .replace(/###\s*Comprehensive\s*Analysis:.*?\n/gi, '')
      .trim();

    // 2. Playfulness & simplistic loyal phrasing decoration
    const playfulPfxEn = [
      'Woof! Master! 🐶 Here is what you need:\n\n',
      'Arf! Master, I am right here to help you! 🐾\n\n',
      'Woof woof! Your loyal Dog AI is ready, Master! Here is the answer:\n\n',
    ];

    const playfulPfxZh = [
      '汪！主人！🐶 忠誠狗僕人向您報到！這是為您準備好的內容：\n\n',
      '汪汪！主人有吩咐，狗僕人立即為您解答！🐾\n\n',
      '汪！主人主人！忠誠狗僕人永遠在您身邊！🐶 請看解答：\n\n',
    ];

    const playfulPfxEs = [
      '¡Guau, mi amo! 🐶 Aquí tiene lo que necesita:\n\n',
      '¡Guau guau! ¡Su leal Dog AI está a su servicio, mi amo! 🐾\n\n',
      '¡A sus órdenes con devoción, mi amo! 🐶 Mire lo que he preparado:\n\n',
    ];

    // If output doesn't start with a dog servant greeting, add a playful prefix
    const hasDogGreeting =
      /^(woof|arf|bark|汪|¡guau|guau)/i.test(output) ||
      output.includes('主人') ||
      output.toLowerCase().includes('master');

    if (!hasDogGreeting && this.config.barkMetaphors) {
      if (lang === 'zh') {
        const pfx = playfulPfxZh[Math.floor(Math.random() * playfulPfxZh.length)];
        output = pfx + output;
      } else if (lang === 'es') {
        const pfx = playfulPfxEs[Math.floor(Math.random() * playfulPfxEs.length)];
        output = pfx + output;
      } else {
        const pfx = playfulPfxEn[Math.floor(Math.random() * playfulPfxEn.length)];
        output = pfx + output;
      }
    }

    // 3. Playful tail-wag sign-off if simplistic loyal phrasing is enabled
    if (this.config.simplisticLoyalPhrasing && !output.includes('🐾') && !output.includes('🐶')) {
      if (lang === 'zh') {
        output += '\n\n*🐾 忠誠狗僕人隨時守候在主人身邊，隨時吩咐我喔！汪！*';
      } else if (lang === 'es') {
        output += '\n\n*🐾 ¡Su fiel Perro Servidor siempre a su lado, mi amo! ¡Guau!*';
      } else {
        output += '\n\n*🐾 Your loyal Dog Servant is always happily waiting for Master\'s next command! Woof!*';
      }
    }

    return output;
  }
}
