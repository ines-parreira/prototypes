export type KeyboardAction = {
    key: string | string[]
    action?: (e: Event) => void
    description: string
    component?: string
}

export type KeymapActions = {
    [key: string]: KeyboardAction
}

export type KeyMap = {
    description?: string
    actions: KeymapActions
}

export type Shortcuts = Record<string, KeyMap>
