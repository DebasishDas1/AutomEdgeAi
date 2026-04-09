declare module 'retell-client-js-sdk' {
  export class RetellWebClient {
    constructor();
    on(event: string, callback: (...args: unknown[]) => void): void;
    startCall(config: { accessToken: string; sampleRate?: number; captureDeviceId?: string; playbackDeviceId?: string; emitRawAudioSamples?: boolean }): Promise<void>;
    stopCall(): void;
  }
}
