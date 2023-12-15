export const Themes = {
    system: {
        label: 'Use system setting',
        settingsLabel: 'System',
        icon: 'computer',
    },
    dark: {
        label: 'Dark',
        icon: 'dark_mode',
    },
    light: {
        label: 'Light',
        icon: 'brightness_high',
    },
    ['modern light']: {
        label: 'Default',
        icon: 'brightness_6',
    },
}
export type Theme = keyof typeof Themes
export type ThemeValue = Exclude<Theme, 'system'>
