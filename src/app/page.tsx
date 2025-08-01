'use client'

import { useState, useCallback, useEffect } from 'react'

interface Connection {
  firstName: string
  lastName: string
  company: string
  originalIndex: number
}

interface ProcessedConnection extends Connection {
  known: boolean
}

export default function ConnectionSorter() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [processedConnections, setProcessedConnections] = useState<ProcessedConnection[]>([])
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [sortingComplete, setSortingComplete] = useState(false)

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isProcessing && connections.length > 0 && currentIndex < connections.length) {
        if (e.key === '1') {
          handleKnow()
        } else if (e.key === '2') {
          handleDontKnow()
        } else if (e.key === '3') {
          handleSkip()
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          handleUndo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, connections, isProcessing])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
      parseCSV(droppedFile)
    } else {
      setError('Please upload a CSV file')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }, [])

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const findColumns = (headers: string[]): { firstName: number, lastName: number, company: number } | null => {
    let firstName = -1
    let lastName = -1
    let company = -1

    headers.forEach((header, index) => {
      const normalized = header.toLowerCase().trim()
      
      if (normalized.includes('first') && normalized.includes('name')) {
        firstName = index
      } else if (normalized.includes('last') && normalized.includes('name')) {
        lastName = index
      } else if (normalized.includes('company') || normalized.includes('organization') || normalized.includes('employer')) {
        company = index
      }
    })

    if (firstName === -1 || lastName === -1 || company === -1) {
      return null
    }

    return { firstName, lastName, company }
  }

  const parseCSV = async (csvFile: File) => {
    setIsProcessing(true)
    setError('')
    setConnections([])
    setCurrentIndex(0)
    setProcessedConnections([])
    setSortingComplete(false)

    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        setError('The CSV file is empty')
        setIsProcessing(false)
        return
      }

      const headers = parseCSVLine(lines[0])
      const columnIndices = findColumns(headers)
      
      if (!columnIndices) {
        setError('Could not find required columns: First Name, Last Name, and Company')
        setIsProcessing(false)
        return
      }

      const parsedConnections: Connection[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const firstName = values[columnIndices.firstName]?.trim() || ''
        const lastName = values[columnIndices.lastName]?.trim() || ''
        const company = values[columnIndices.company]?.trim() || ''
        
        // Only add if we have at least a first or last name
        if (firstName || lastName) {
          parsedConnections.push({
            firstName: firstName.replace(/^["']|["']$/g, ''),
            lastName: lastName.replace(/^["']|["']$/g, ''),
            company: company.replace(/^["']|["']$/g, ''),
            originalIndex: i
          })
        }
      }

      if (parsedConnections.length === 0) {
        setError('No valid connections found in the CSV')
        setIsProcessing(false)
        return
      }

      setConnections(parsedConnections)
    } catch (err) {
      setError('Failed to parse CSV file. Please ensure it\'s properly formatted.')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKnow = () => {
    if (currentIndex < connections.length) {
      const connection = connections[currentIndex]
      setProcessedConnections([...processedConnections, { ...connection, known: true }])
      
      if (currentIndex === connections.length - 1) {
        setSortingComplete(true)
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  const handleDontKnow = () => {
    if (currentIndex < connections.length) {
      const connection = connections[currentIndex]
      setProcessedConnections([...processedConnections, { ...connection, known: false }])
      
      if (currentIndex === connections.length - 1) {
        setSortingComplete(true)
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  const handleSkip = () => {
    if (currentIndex < connections.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentIndex === connections.length - 1) {
      setSortingComplete(true)
    }
  }

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      // Remove the last processed connection if it was from the previous index
      const lastProcessed = processedConnections[processedConnections.length - 1]
      if (lastProcessed && lastProcessed.originalIndex === connections[currentIndex - 1].originalIndex) {
        setProcessedConnections(processedConnections.slice(0, -1))
      }
    }
  }

  const downloadKnownContacts = () => {
    const knownContacts = processedConnections.filter(c => c.known)
    
    // Create CSV content
    const csvContent = [
      'First Name,Last Name,Company',
      ...knownContacts.map(c => 
        `"${c.firstName}","${c.lastName}","${c.company}"`
      )
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'known_contacts.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setConnections([])
    setCurrentIndex(0)
    setProcessedConnections([])
    setError('')
    setSortingComplete(false)
  }

  const currentConnection = connections[currentIndex]
  const knownCount = processedConnections.filter(c => c.known).length
  const unknownCount = processedConnections.filter(c => !c.known).length
  const skippedCount = currentIndex - processedConnections.length

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Connection Sorter</h1>
        <p className="text-gray-400 text-center mb-8">
          {!connections.length ? 'Upload your LinkedIn connections CSV' : 'Sort your connections by who you know'}
        </p>

        {/* Upload Area */}
        {!connections.length && !isProcessing && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
              }
            `}
          >
            <div className="space-y-4">
              <div className="text-5xl">👥</div>
              <div>
                <p className="text-xl mb-2">Drag and drop your LinkedIn connections CSV</p>
                <p className="text-gray-400">or</p>
              </div>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer inline-block transition-colors">
                  Choose File
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-2 text-gray-400">Processing CSV...</p>
          </div>
        )}

        {/* Sorting Interface */}
        {currentConnection && !sortingComplete && (
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress: {currentIndex + 1} of {connections.length}</span>
                <span>{Math.round(((currentIndex + 1) / connections.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / connections.length) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-green-400 text-2xl font-bold">{knownCount}</p>
                  <p className="text-sm text-gray-400">Known</p>
                </div>
                <div>
                  <p className="text-red-400 text-2xl font-bold">{unknownCount}</p>
                  <p className="text-sm text-gray-400">Unknown</p>
                </div>
                <div>
                  <p className="text-yellow-400 text-2xl font-bold">{skippedCount}</p>
                  <p className="text-sm text-gray-400">Skipped</p>
                </div>
              </div>
            </div>

            {/* Current Connection Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-2">
                {currentConnection.firstName} {currentConnection.lastName}
              </h2>
              {currentConnection.company && (
                <p className="text-xl text-gray-400">{currentConnection.company}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleKnow}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-6 text-xl font-semibold transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-3xl">1</span>
                <span>I Know Them</span>
              </button>
              <button
                onClick={handleDontKnow}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-6 text-xl font-semibold transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-3xl">2</span>
                <span>I Don&apos;t Know Them</span>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex justify-between">
              <button
                onClick={handleUndo}
                disabled={currentIndex === 0}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  currentIndex === 0 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                ← Undo (Left Arrow)
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Skip (3)
              </button>
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {sortingComplete && (
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Sorting Complete!</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-green-600/20 rounded-lg p-6">
                  <p className="text-4xl font-bold text-green-400">{knownCount}</p>
                  <p className="text-lg">Known Contacts</p>
                </div>
                <div className="bg-red-600/20 rounded-lg p-6">
                  <p className="text-4xl font-bold text-red-400">{unknownCount}</p>
                  <p className="text-lg">Unknown Contacts</p>
                </div>
              </div>

              {skippedCount > 0 && (
                <p className="text-yellow-400 mb-6">
                  {skippedCount} contacts were skipped
                </p>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={downloadKnownContacts}
                  disabled={knownCount === 0}
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    knownCount === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Download Known Contacts CSV
                </button>
                <button
                  onClick={reset}
                  className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}