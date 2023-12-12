export const Themes = {
    system: {
        label: 'Use system setting',
    },
    dark: {
        label: 'Dark',
    },
    light: {
        label: 'Light',
    },
    modern: {
        label: 'Default',
    },
}

export type Theme = keyof typeof Themes
export type ThemeValue = Exclude<Theme, 'system'>
