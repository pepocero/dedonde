import { useEffect, useRef, useState } from 'react'
import { normalizeBarcode } from '../utils/barcode.ts'
import { CloseIcon } from './Icons.tsx'

const NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'] as const

type ScannerPhase = 'requesting' | 'scanning' | 'error'
type ScannerErrorKind = 'unsupported' | 'permission' | 'missing' | 'camera'

type BarcodeScannerProps = {
  onDetected: (code: string) => void
  onCancel: () => void
  onError?: (kind: ScannerErrorKind) => void
}

function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop())
}

function isDomException(error: unknown, names: string[]): boolean {
  return error instanceof DOMException && names.includes(error.name)
}

async function canUseNativeDetector(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof window.BarcodeDetector !== 'function') {
    return false
  }

  try {
    const formats = await window.BarcodeDetector.getSupportedFormats()
    return NATIVE_FORMATS.some((format) => formats.includes(format))
  } catch {
    return false
  }
}

function isDetectedBarcode(value: unknown): boolean {
  const code = normalizeBarcode(value)
  return code.length >= 8 && code.length <= 14
}

export default function BarcodeScanner({ onDetected, onCancel, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [phase, setPhase] = useState<ScannerPhase>('requesting')
  const [message, setMessage] = useState('Solicitando acceso a la cámara…')

  useEffect(() => {
    const maybeVideo = videoRef.current
    if (!maybeVideo) {
      return undefined
    }
    const preview: HTMLVideoElement = maybeVideo

    let cancelled = false
    let stream: MediaStream | null = null
    let intervalId = 0
    let zxingControls: { stop: () => void } | null = null
    let handled = false

    const finishWithCode = (rawValue: string) => {
      if (handled || cancelled) {
        return
      }
      const code = normalizeBarcode(rawValue)
      if (!isDetectedBarcode(code)) {
        return
      }
      handled = true
      onDetected(code)
    }

    const fail = (kind: ScannerErrorKind, text: string) => {
      if (cancelled || handled) {
        return
      }
      setPhase('error')
      setMessage(text)
      onError?.(kind)
    }

    async function startNative(detector: BarcodeDetector) {
      setPhase('scanning')
      setMessage('Coloca el código de barras dentro del recuadro')

      intervalId = window.setInterval(async () => {
        if (cancelled || handled || preview.readyState < 2) {
          return
        }

        try {
          const barcodes = await detector.detect(preview)
          const match = barcodes.find((item) => isDetectedBarcode(item.rawValue))
          if (match) {
            window.clearInterval(intervalId)
            finishWithCode(match.rawValue)
          }
        } catch {
          // Un frame ilegible no debe interrumpir el escaneo.
        }
      }, 180)
    }

    async function startZxing(mediaStream: MediaStream) {
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ])

      if (cancelled || handled) {
        return
      }

      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      const reader = new BrowserMultiFormatReader(hints)
      setPhase('scanning')
      setMessage('Coloca el código de barras dentro del recuadro')

      zxingControls = await reader.decodeFromStream(mediaStream, preview, (result) => {
        if (result) {
          finishWithCode(result.getText())
        }
      })
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        fail('unsupported', 'Este navegador no permite usar la cámara.')
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
      } catch (error) {
        if (isDomException(error, ['NotAllowedError', 'PermissionDeniedError'])) {
          fail(
            'permission',
            'Necesitamos acceso a la cámara para leer el código de barras. Puedes introducirlo manualmente.',
          )
          return
        }
        if (isDomException(error, ['NotFoundError', 'OverconstrainedError'])) {
          fail('missing', 'No hemos encontrado una cámara en este dispositivo.')
          return
        }
        fail('camera', 'No hemos podido abrir la cámara. Puedes introducir el código manualmente.')
        return
      }

      if (cancelled) {
        stopStream(stream)
        return
      }

      preview.srcObject = stream
      preview.setAttribute('playsinline', 'true')
      preview.muted = true

      try {
        await preview.play()
      } catch {
        if (!cancelled) {
          fail('camera', 'No hemos podido iniciar la cámara.')
        }
        return
      }

      if (cancelled) {
        return
      }

      const useNative = await canUseNativeDetector()
      if (cancelled || handled) {
        return
      }

      if (useNative) {
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats()
        const formats = NATIVE_FORMATS.filter((format) => supportedFormats.includes(format))
        await startNative(new window.BarcodeDetector({ formats }))
        return
      }

      if (!stream) {
        fail('camera', 'No hemos podido abrir la cámara. Puedes introducir el código manualmente.')
        return
      }

      try {
        await startZxing(stream)
      } catch {
        fail('camera', 'No hemos podido iniciar el lector de códigos de barras.')
      }
    }

    start()

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      zxingControls?.stop()
      stopStream(stream)
      if (preview.srcObject) {
        preview.srcObject = null
      }
    }
  }, [onDetected, onError])

  return (
    <section className="scanner" aria-label="Escáner de código de barras">
      <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
      <div className="scanner-overlay" aria-hidden="true">
        <div className="viewfinder">
          <span className="viewfinder-corner tl" />
          <span className="viewfinder-corner tr" />
          <span className="viewfinder-corner bl" />
          <span className="viewfinder-corner br" />
        </div>
      </div>
      <div className="scanner-top">
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Cerrar escáner">
          <CloseIcon />
        </button>
      </div>
      <div className="scanner-bottom">
        <p className="scanner-status">{message}</p>
        {phase === 'scanning' ? (
          <p className="privacy-note scanner-note">
            La cámara solo se usa para leer el código. No se guarda ninguna foto.
          </p>
        ) : null}
        {phase === 'error' ? (
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Introducir código manualmente
          </button>
        ) : null}
      </div>
    </section>
  )
}
