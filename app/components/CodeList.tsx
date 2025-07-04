'use client'

import { useState } from 'react'

interface CodeListProps {
  codes: string[]
  onRemoveCode: (index: number) => void
  onCopyCode: (code: string) => void
  onCopyAll: () => void
  onClearAll: () => void
}

const CodeList: React.FC<CodeListProps> = ({
  codes,
  onRemoveCode,
  onCopyCode,
  onCopyAll,
  onClearAll
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCode = (code: string, index: number) => {
    onCopyCode(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (codes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-600">Nenhum número capturado ainda</p>
        <p className="text-sm text-gray-500 mt-1">
          Use o scanner acima para começar a capturar números dos códigos de barras
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Números Capturados ({codes.length})
          </h2>
          <div className="flex gap-2">
            {codes.length > 1 && (
              <button
                onClick={onCopyAll}
                className="btn btn-success text-sm"
                title="Copiar todos os números"
              >
                Copiar Todos
              </button>
            )}
            <button
              onClick={onClearAll}
              className="btn btn-danger text-sm"
              title="Limpar todos os números"
            >
              Limpar Tudo
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {codes.map((code, index) => (
          <div key={index} className="code-item">
            <div className="flex-1 mr-3">
              <div className="font-mono text-sm text-gray-800 break-all">
                {code}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Número {index + 1} • {code.length} dígitos
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleCopyCode(code, index)}
                className={`btn text-xs ${
                  copiedIndex === index ? 'btn-success' : 'btn-primary'
                }`}
                title="Copiar este número"
              >
                {copiedIndex === index ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    OK
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </span>
                )}
              </button>
              
              <button
                onClick={() => onRemoveCode(index)}
                className="btn btn-danger text-xs"
                title="Remover este número"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t bg-gray-50 rounded-b-lg text-center">
        <p className="text-xs text-gray-600">
          Toque em "Copiar" para copiar um número individual ou "Copiar Todos" para copiar todos de uma vez
        </p>
      </div>
    </div>
  )
}

export default CodeList