import type {MouseEvent} from 'react'

export type Delta = {
    x: number
    y: number
}

export type Drag = {
    handle: number
    position: {x: number; y: number}
    sizes: Record<string, number>
}

export type Panel = {
    config: PanelConfig
    listener: PanelListener
}

export type PanelConfig = {
    minSize: number
    maxSize: number
    defaultSize: number
}

export type PanelListener = (panelState: PanelState) => void

export type PanelState = {
    resizer?: (e: MouseEvent) => void
    size: number
}
