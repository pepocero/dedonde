import { useCallback, useSyncExternalStore } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallSnapshot = {
  canPrompt: boolean
  installed: boolean
}

const subscribers = new Set<() => void>()

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
let snapshot: InstallSnapshot = { canPrompt: false, installed: false }

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    nav.standalone === true
  )
}

function isIosDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const ua = window.navigator.userAgent
  const iPhone = /iPhone|iPad|iPod/i.test(ua)
  const iPadOs = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
  return iPhone || iPadOs
}

function updateSnapshot() {
  const next: InstallSnapshot = {
    canPrompt: deferredPrompt !== null,
    installed,
  }
  if (next.canPrompt !== snapshot.canPrompt || next.installed !== snapshot.installed) {
    snapshot = next
  }
}

function emit() {
  updateSnapshot()
  for (const listener of subscribers) {
    listener()
  }
}

function subscribe(listener: () => void) {
  subscribers.add(listener)
  return () => {
    subscribers.delete(listener)
  }
}

function getSnapshot(): InstallSnapshot {
  return snapshot
}

if (typeof window !== 'undefined') {
  installed = isStandaloneDisplay()
  updateSnapshot()

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installed = true
    emit()
  })

  const displayModeQuery = window.matchMedia('(display-mode: standalone)')
  const onDisplayMode = () => {
    if (isStandaloneDisplay()) {
      deferredPrompt = null
      installed = true
      emit()
    }
  }
  if (typeof displayModeQuery.addEventListener === 'function') {
    displayModeQuery.addEventListener('change', onDisplayMode)
  } else {
    displayModeQuery.addListener(onDisplayMode)
  }
}

export function usePwaInstall() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const ios = !state.installed && isIosDevice()
  const visible = !state.installed && (state.canPrompt || ios)

  const install = useCallback(async (): Promise<'prompted' | 'ios' | 'unavailable'> => {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt
      deferredPrompt = null
      emit()
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') {
        installed = true
        emit()
      }
      return 'prompted'
    }

    if (isIosDevice() && !installed) {
      return 'ios'
    }

    return 'unavailable'
  }, [])

  return {
    visible,
    isIos: ios,
    install,
  }
}
