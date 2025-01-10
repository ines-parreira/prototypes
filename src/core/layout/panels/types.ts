export type Drag = {
    handle: number
    position: {x: number; y: number}
    sizes: Record<string, number>
}

export type PanelConfig = {
    minSize: number
    maxSize: number
    defaultSize: number
}
