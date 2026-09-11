import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall.ts'
import { AddToHomeIcon, CloseIcon, InstallIcon, ShareIcon } from './Icons.tsx'

export default function InstallAppButton() {
  const { visible, isIos, install } = usePwaInstall()
  const [hintOpen, setHintOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const closeHint = useCallback(() => {
    setHintOpen(false)
  }, [])

  useEffect(() => {
    if (!hintOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setHintOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [hintOpen])

  if (!visible) {
    return null
  }

  async function handleClick() {
    const result = await install()
    if (result === 'ios') {
      setHintOpen(true)
    }
  }

  return (
    <>
      <button
        type="button"
        className="button button-install"
        onClick={() => {
          void handleClick()
        }}
        aria-label="Instalar DeDónde"
        aria-haspopup={isIos ? 'dialog' : undefined}
        aria-expanded={isIos ? hintOpen : undefined}
      >
        <InstallIcon />
        Instalar
      </button>

      {hintOpen ? (
        <div className="install-overlay" onClick={closeHint}>
          <div
            ref={dialogRef}
            className="install-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="install-sheet-head">
              <h2 id={titleId}>Instalar DeDónde</h2>
              <button type="button" className="install-sheet-close" onClick={closeHint} aria-label="Cerrar">
                <CloseIcon size={20} />
              </button>
            </div>
            <p>En iPhone o iPad, añádela a la pantalla de inicio:</p>
            <ol className="install-steps">
              <li>
                <span className="install-step-icon">
                  <ShareIcon size={20} />
                </span>
                Pulsa <strong>Compartir</strong>
              </li>
              <li>
                <span className="install-step-icon">
                  <AddToHomeIcon size={20} />
                </span>
                Elige <strong>Añadir a pantalla de inicio</strong>
              </li>
            </ol>
          </div>
        </div>
      ) : null}
    </>
  )
}
