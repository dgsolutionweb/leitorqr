'use client'

import { useState } from 'react'
import BarcodeNumberReader from './components/BarcodeNumberReader'
import CodeList from './components/CodeList'
import PWAInstallPrompt from './components/PWAInstallPrompt'

export default function Home() {
  const [scannedNumbers, setScannedNumbers] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const addNumber = (number: string) => {
    if (number && !scannedNumbers.includes(number)) {
      setScannedNumbers(prev => [...prev, number])
    }
  }

  const removeNumber = (index: number) => {
    setScannedNumbers(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllNumbers = () => {
    setScannedNumbers([])
  }

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number)
    alert('Número copiado!')
  }

  const copyAllNumbers = () => {
    const allNumbers = scannedNumbers.join('\n')
    navigator.clipboard.writeText(allNumbers)
    alert('Todos os números copiados!')
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Leitor de Números do Código de Barras
        </h1>
        
        <div className="mb-6">
          <div className="text-center mb-4">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`btn w-full text-lg py-3 ${
                isScanning ? 'btn-danger' : 'btn-primary'
              }`}
            >
              {isScanning ? '🛑 Parar Scanner' : '📱 Iniciar Scanner'}
            </button>
          </div>

          {isScanning && (
            <BarcodeNumberReader onNumberDetected={addNumber} />
          )}
        </div>

        <CodeList
          codes={scannedNumbers}
          onRemoveCode={removeNumber}
          onCopyCode={copyNumber}
          onCopyAll={copyAllNumbers}
          onClearAll={clearAllNumbers}
        />
      </div>
      
      <PWAInstallPrompt />
    </main>
  )
}