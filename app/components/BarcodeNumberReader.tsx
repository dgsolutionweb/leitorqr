'use client'

import { useEffect, useRef, useState } from 'react'

interface BarcodeNumberReaderProps {
  onNumberDetected: (number: string) => void
  onScanComplete?: () => void
}

const BarcodeNumberReader: React.FC<BarcodeNumberReaderProps> = ({ onNumberDetected, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<string>('')
  const [detectionMethod, setDetectionMethod] = useState<string>('')
  const [shouldContinueScanning, setShouldContinueScanning] = useState(true)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let Quagga: any
    let Tesseract: any
    
    const initReader = async () => {
      try {
        // Importações dinâmicas
        Quagga = (await import('quagga')).default
        Tesseract = (await import('tesseract.js')).default
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsActive(true)
          
          // Inicializar Quagga para códigos de barras
          initQuagga()
          
          // Inicializar OCR para números
          startOCR()
        }

      } catch (err) {
        console.error('Erro ao acessar câmera:', err)
        setError('Erro ao acessar a câmera. Verifique as permissões.')
      }
    }

    const initQuagga = () => {
      if (!videoRef.current || !Quagga) return

      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 1280,
            height: 720,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true,
        locator: {
          halfSample: true,
          patchSize: "large"
        }
      }, (err: any) => {
        if (err) {
          console.error('Erro ao inicializar Quagga:', err)
          return
        }
        
        Quagga.start()
      })

      Quagga.onDetected((data: any) => {
        if (!shouldContinueScanning) return
        
        const code = data.codeResult.code
        if (code && code !== lastDetection) {
          handleDetection(code, 'Código de Barras')
        }
      })
    }

    const startOCR = () => {
      intervalRef.current = setInterval(async () => {
        if (!shouldContinueScanning) return
        
        if (videoRef.current && canvasRef.current && Tesseract) {
          const video = videoRef.current
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          
          if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            
            try {
              // Configuração otimizada para números de código de barras
              const { data: { text } } = await Tesseract.recognize(
                canvas,
                'eng',
                {
                  logger: () => {},
                  tessedit_char_whitelist: '0123456789',
                  tessedit_pageseg_mode: '8', // Tratar como uma única palavra
                  tessedit_ocr_engine_mode: '1' // Neural nets LSTM engine
                } as any
              )
              
              // Extrair sequências de números
              const numbers = text.match(/\d{8,}/g) // Pelo menos 8 dígitos consecutivos
              if (numbers && numbers.length > 0) {
                const longestNumber = numbers.reduce((a: string, b: string) => a.length > b.length ? a : b)
                if (longestNumber.length >= 8 && longestNumber !== lastDetection) {
                  handleDetection(longestNumber, 'OCR')
                }
              }
            } catch (ocrError) {
              console.error('Erro no OCR:', ocrError)
            }
          }
        }
      }, 1500) // Verificar a cada 1.5 segundos
    }

    const handleDetection = (number: string, method: string) => {
      if (!shouldContinueScanning) return
      
      setLastDetection(number)
      setDetectionMethod(method)
      onNumberDetected(number)
      
      // Parar escaneamento após detectar
      setShouldContinueScanning(false)
      
      // Vibração
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
      
      // Parar Quagga
      if (Quagga) {
        Quagga.stop()
      }
      
      // Parar OCR
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      // Notificar que o scan foi completado
      if (onScanComplete) {
        onScanComplete()
      }
      
      // Limpar timeout anterior
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current)
      }
      
      // Limpar indicação após 3 segundos
      detectionTimeoutRef.current = setTimeout(() => {
        setLastDetection('')
        setDetectionMethod('')
      }, 3000)
    }

    initReader()

    return () => {
      if (Quagga) {
        Quagga.stop()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsActive(false)
    }
  }, [])

  const captureManually = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        try {
          const Tesseract = (await import('tesseract.js')).default
          const { data: { text } } = await Tesseract.recognize(
            canvas,
            'eng',
            {
              logger: () => {},
              tessedit_char_whitelist: '0123456789',
              tessedit_pageseg_mode: '8'
            } as any
          )
          
          const numbers = text.match(/\d+/g)
          if (numbers && numbers.length > 0) {
            const allNumbers = numbers.join('')
            if (allNumbers.length >= 1) {
              onNumberDetected(allNumbers)
              
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
              }
            }
          } else {
            alert('Nenhum número detectado. Tente ajustar o foco ou iluminação.')
          }
        } catch (ocrError) {
          console.error('Erro no OCR:', ocrError)
          alert('Erro ao processar a imagem.')
        }
      }
    }
  }

  if (error) {
    return (
      <div className="scanner-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro de Câmera</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Certifique-se de que:</p>
          <ul className="text-xs mt-1 list-disc list-inside">
            <li>A câmera não está sendo usada por outro app</li>
            <li>Você permitiu acesso à câmera</li>
            <li>Está usando HTTPS (necessário para câmera)</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="scanner-container">
      <video
        ref={videoRef}
        className="scanner-video"
        autoPlay
        playsInline
        muted
      />
      
      {/* Overlay otimizado para códigos de barras */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-20 border-2 border-red-500 rounded-lg">
          <div className="absolute -top-6 left-0 text-red-500 text-sm font-medium">
            Alinhe o código de barras aqui
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="text-center mt-4 space-y-3">
        {isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800 font-medium mb-1">
              🔍 Scanner Ativo - Detectando automaticamente
            </div>
            <div className="text-xs text-blue-600">
              Aponte para o código de barras e os números abaixo dele
            </div>
          </div>
        )}
        
        <button
          onClick={captureManually}
          className="btn btn-success w-full"
        >
          📸 Capturar Manualmente
        </button>
        
        {lastDetection && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-800 font-medium">
              ✅ Detectado via {detectionMethod}
            </div>
            <div className="text-lg font-mono text-green-900 mt-1">
              {lastDetection}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          💡 <strong>Dicas:</strong><br/>
          • Mantenha o código bem iluminado<br/>
          • Evite reflexos na superfície<br/>
          • Mantenha a câmera estável<br/>
          • Certifique-se que os números estão visíveis
        </div>
      </div>
    </div>
  )
}

export default BarcodeNumberReader