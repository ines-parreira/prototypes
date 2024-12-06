import {ThemeColors, UIKitThemeType} from '@gorgias/merchant-ui-kit'

export type ColorTokens = ThemeColors
export type ThemeName = UIKitThemeType
export type HelpdeskThemeName = ThemeName | 'system'

export type SetTheme = (theme: HelpdeskThemeName) => void

export type Theme = {
    name: HelpdeskThemeName
    resolvedName: ThemeName
    tokens: ColorTokens
}

export type ThemeConfig = {
    icon: string
    label: string
    name: HelpdeskThemeName
    settingsLabel?: string
}
