import type { SizeValue } from '@gorgias/axiom'

export type PlaygroundState = {
    isOpen: boolean
    onTest: () => void
    onClose: () => void
    sidePanelWidth: SizeValue
    shouldHideFullscreenButton: boolean
}

const noop = () => undefined

export const defaultPlaygroundState: PlaygroundState = {
    isOpen: false,
    onTest: noop,
    onClose: noop,
    sidePanelWidth: '100vw',
    shouldHideFullscreenButton: false,
}
