import { VoiceSettings } from '../types';

export class VoiceSystemManager {
  private static instance: VoiceSystemManager;
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private availableVoices: SpeechSynthesisVoice[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public static getInstance(): VoiceSystemManager {
    if (!VoiceSystemManager.instance) {
      VoiceSystemManager.instance = new VoiceSystemManager();
    }
    return VoiceSystemManager.instance;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.synth && this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  public isVoiceSupported(): { tts: boolean; stt: boolean } {
    return {
      tts: !!this.synth,
      stt: !!this.recognition,
    };
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (err: any) => void
  ): boolean {
    if (!this.recognition) return false;

    try {
      this.isListening = true;
      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        onResult(final || interim, !!final);
      };

      this.recognition.onerror = (e: any) => {
        this.isListening = false;
        onError(e);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      onError(e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.synth || !settings.voiceEnabled) return;

    this.stopSpeaking();

    // Clean markdown characters for pleasant speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, ' ')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.rate || 1.0;
    utterance.pitch = settings.pitch || 1.0;

    if (settings.selectedVoiceURI && this.availableVoices.length > 0) {
      const foundVoice = this.availableVoices.find(v => v.voiceURI === settings.selectedVoiceURI);
      if (foundVoice) {
        utterance.voice = foundVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
