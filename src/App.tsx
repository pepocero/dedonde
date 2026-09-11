import { useCallback, useState } from 'react'
import BarcodeScanner from './components/BarcodeScanner.tsx'
import Loading from './components/Loading.tsx'
import ProductResult from './components/ProductResult.tsx'
import SearchBar from './components/SearchBar.tsx'
import Gs1PrefixNotice from './components/Gs1PrefixNotice.tsx'
import Gs1CountryHint from './components/Gs1CountryHint.tsx'
import { CameraIcon, LogoMark } from './components/Icons.tsx'
import { useProductLookup } from './hooks/useProductLookup.ts'
import type { ErrorKind } from './services/openFoodFacts.ts'
import { getGS1PrefixWarning, getGs1PrefixAssignment } from './utils/gs1.ts'

type AppMode = 'home' | 'scanner'

const ERROR_MESSAGES: Record<ErrorKind, string> = {
  timeout: 'La búsqueda está tardando demasiado. Inténtalo de nuevo.',
  network: 'No hemos podido conectar. Comprueba tu conexión e inténtalo de nuevo.',
  unavailable: 'El servicio no está disponible en este momento. Inténtalo más tarde.',
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [queriedBarcode, setQueriedBarcode] = useState<string | null>(null)
  const { status, product, errorKind, lookup, reset, isBusy } = useProductLookup()

  const startScan = useCallback(() => {
    reset()
    setMode('scanner')
  }, [reset])

  const goHome = useCallback(() => {
    reset()
    setMode('home')
  }, [reset])

  const handleCode = useCallback(
    async (code: string) => {
      setMode('home')
      setQueriedBarcode(code)
      await lookup(code)
    },
    [lookup],
  )

  const handleDetected = useCallback(
    (code: string) => {
      setMode('home')
      setQueriedBarcode(code)
      void lookup(code)
    },
    [lookup],
  )

  const gs1Warning = getGS1PrefixWarning(queriedBarcode)
  const gs1CountryHint = !gs1Warning ? getGs1PrefixAssignment(queriedBarcode) : null

  if (mode === 'scanner') {
    return (
      <main className="app app-scanner">
        <BarcodeScanner onDetected={handleDetected} onCancel={goHome} />
      </main>
    )
  }

  return (
    <main className="app">
      <header className="topbar">
        <LogoMark size={40} />
        <div>
          <p className="eyebrow">DeDónde</p>
          <h1>De Dónde</h1>
        </div>
      </header>

      {status === 'loading' ? <Loading /> : null}

      {status === 'found' && product ? (
        <ProductResult
          product={product}
          queriedBarcode={queriedBarcode}
          onScanAgain={startScan}
          onManualSearch={handleCode}
          busy={isBusy}
        />
      ) : null}

      {status === 'not_found' ? (
        <section className="status-card">
          <h2>Código de barras válido, pero producto no encontrado</h2>
          <p>El código de barras es correcto, pero no hemos encontrado este producto en nuestra base de datos.</p>
          {gs1Warning ? <Gs1PrefixNotice warning={gs1Warning} /> : null}
          {gs1CountryHint ? <Gs1CountryHint assignment={gs1CountryHint} /> : null}
          <button type="button" className="button button-primary" onClick={startScan} disabled={isBusy}>
            <CameraIcon />
            Escanear otro producto
          </button>
          <SearchBar onSearch={handleCode} disabled={isBusy} label="Introducir otro código" />
        </section>
      ) : null}

      {status === 'error' ? (
        <section className="status-card">
          <h2>No se ha podido completar la búsqueda</h2>
          <p>{ERROR_MESSAGES[errorKind ?? 'network']}</p>
          {gs1Warning ? <Gs1PrefixNotice warning={gs1Warning} /> : null}
          {gs1CountryHint ? <Gs1CountryHint assignment={gs1CountryHint} /> : null}
          <button type="button" className="button button-primary" onClick={startScan} disabled={isBusy}>
            <CameraIcon />
            Escanear otro producto
          </button>
          <SearchBar onSearch={handleCode} disabled={isBusy} label="Introducir otro código" />
        </section>
      ) : null}

      {status === 'idle' ? (
        <section className="home">
          <div className="hero">
            <p className="tagline">Descubre de dónde viene un producto</p>
          </div>
          <div className="home-visual">
            <img
              src="/images/scan.png"
              alt="Teléfono en la mano escaneando un código"
            />
          </div>
          <div className="home-actions">
            <button type="button" className="button button-primary button-xl" onClick={startScan}>
              <CameraIcon size={26} />
              Escanear producto
            </button>
            <SearchBar onSearch={handleCode} />
            <p className="privacy-note">
              El acceso a la cámara solo se utiliza para leer el código de barras. No se guarda ni se envía ninguna
              fotografía.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  )
}
