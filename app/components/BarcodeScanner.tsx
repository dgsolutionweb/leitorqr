'use client'

import { useEffect, useRef, useState } from 'react'

interface BarcodeScannerProps {
  onCodeScanned: (code: string) => void
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onCodeScanned }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let Quagga: any
    
    const initScanner = async () => {
      try {
        // Importação dinâmica do Quagga
        Quagga = (await import('quagga')).default
        
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
          videoRef.current.play()
        }

        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment"
            }
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader"
            ]
          },
          locate: true,
          locator: {
            halfSample: true,
            patchSize: "medium"
          }
        }, (err: any) => {
          if (err) {
            console.error('Erro ao inicializar Quagga:', err)
            setError('Erro ao inicializar o scanner')
            return
          }
          
          setIsScanning(true)
          Quagga.start()
        })

        Quagga.onDetected((data: any) => {
          const code = data.codeResult.code
          if (code) {
            onCodeScanned(code)
            // Vibração se disponível
            if (navigator.vibrate) {
              navigator.vibrate(200)
            }
          }
        })

      } catch (err) {
        console.error('Erro ao acessar câmera:', err)
        setError('Erro ao acessar a câmera. Verifique as permissões.')
      }
    }

    initScanner()

    return () => {
      if (Quagga) {
        Quagga.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsScanning(false)
    }
  }, [])

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
      
      {isScanning && (
        <div className="text-center mt-2 text-sm text-gray-600">
          Aponte a câmera para o código de barras
        </div>
      )}
    </div>
  )
}

export default BarcodeScanner