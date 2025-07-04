'use client'

import { useEffect, useRef, useState } from 'react'

interface NumberScannerProps {
  onNumberDetected: (number: string) => void
}

const NumberScanner: React.FC<NumberScannerProps> = ({ onNumberDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<string>('')
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let Tesseract: any
    
    const initScanner = async () => {
      try {
        // Importação dinâmica do Tesseract
        Tesseract = (await import('tesseract.js')).default
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })
        
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsScanning(true)
          startOCR()
        }

      } catch (err) {
        console.error('Erro ao acessar câmera:', err)
        setError('Erro ao acessar a câmera. Verifique as permissões.')
      }
    }

    const startOCR = () => {
      intervalRef.current = setInterval(async () => {
        if (videoRef.current && canvasRef.current && Tesseract) {
          const video = videoRef.current
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          
          if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            
            try {
              const { data: { text } } = await Tesseract.recognize(
                canvas,
                'eng',
                {
                  logger: () => {}, // Silenciar logs
                  tessedit_char_whitelist: '0123456789',
                  tessedit_pageseg_mode: '6'
                }
              )
              
              // Extrair números da string
              const numbers = text.match(/\d+/g)
              if (numbers && numbers.length > 0) {
                const detectedNumber = numbers.join('')
                if (detectedNumber.length >= 3 && detectedNumber !== lastDetection) {
                  setLastDetection(detectedNumber)
                  onNumberDetected(detectedNumber)
                  
                  // Vibração se disponível
                  if (navigator.vibrate) {
                    navigator.vibrate(200)
                  }
                }
              }
            } catch (ocrError) {
              console.error('Erro no OCR:', ocrError)
            }
          }
        }
      }, 2000) // Verificar a cada 2 segundos
    }

    initScanner()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsScanning(false)
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
              tessedit_pageseg_mode: '6'
            }
          )
          
          const numbers = text.match(/\d+/g)
          if (numbers && numbers.length > 0) {
            const detectedNumber = numbers.join('')
            if (detectedNumber.length >= 1) {
              onNumberDetected(detectedNumber)
              
              if (navigator.vibrate) {
                navigator.vibrate(200)
              }
            }
          } else {
            alert('Nenhum número detectado. Tente novamente.')
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
          {error}
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
      <div className="scanner-overlay" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="text-center mt-2">
        {isScanning && (
          <div className="text-sm text-gray-600 mb-2">
            Aponte a câmera para números na tela
          </div>
        )}
        
        <button
          onClick={captureManually}
          className="btn btn-success"
        >
          Capturar Agora
        </button>
        
        {lastDetection && (
          <div className="text-sm text-green-600 mt-2">
            Último detectado: {lastDetection}
          </div>
        )}
      </div>
    </div>
  )
}

export default NumberScanner