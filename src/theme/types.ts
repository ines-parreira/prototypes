export enum Theme {
    System = 'system',
    Dark = 'dark',
    Light = 'light',
    Modern = 'modern light',
}

export type ThemeValue = {
    label: string
    settingsLabel?: string
    icon: string
}

export const Themes: {[key in Theme]: ThemeValue} = {
    [Theme.System]: {
        label: 'Use system setting',
        settingsLabel: 'System',
        icon: 'computer',
    },
    [Theme.Dark]: {
        label: 'Dark',
        icon: 'dark_mode',
    },
    [Theme.Light]: {
        label: 'Light',
        icon: 'brightness_high',
    },
    [Theme.Modern]: {
        label: 'Default',
        icon: 'brightness_6',
    },
}
