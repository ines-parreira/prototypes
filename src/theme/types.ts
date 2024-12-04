import {
    ThemeColors,
    ThemeContextType as UIKitThemeContextType,
    UIKitThemeType,
} from '@gorgias/merchant-ui-kit'

export type ColorTokens = ThemeColors
export type ThemeName = UIKitThemeType
export type HelpdeskThemeName = ThemeName | 'system'

export type ThemeContextType = UIKitThemeContextType & {
    theme: ThemeName
    savedTheme: HelpdeskThemeName
    setTheme: (theme: HelpdeskThemeName) => void
}

export type ThemeConfig = {
    icon: string
    label: string
    name: HelpdeskThemeName
    settingsLabel?: string
}
