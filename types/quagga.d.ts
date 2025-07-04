declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string
      type: string
      target: HTMLVideoElement | null
      constraints: {
        width: number
        height: number
        facingMode: string
      }
    }
    decoder: {
      readers: string[]
    }
    locate: boolean
    locator: {
      halfSample: boolean
      patchSize: string
    }
  }

  interface QuaggaResult {
    codeResult: {
      code: string
    }
  }

  interface Quagga {
    init(config: QuaggaConfig, callback: (err: any) => void): void
    start(): void
    stop(): void
    onDetected(callback: (data: QuaggaResult) => void): void
  }

  const quagga: Quagga
  export default quagga
}