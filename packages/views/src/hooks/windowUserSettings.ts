export type WindowUserSettingsEntry = {
    id?: number
    type: string
    data: Record<string, unknown>
}

export function getWindowUserSettings(): WindowUserSettingsEntry[] {
    const win = window as Record<string, any>
    const settings = win.GORGIAS_STATE?.currentUser?.settings

    if (!Array.isArray(settings)) {
        return []
    }

    return settings
}
