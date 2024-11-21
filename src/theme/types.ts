import {
    ThemeColors,
    ThemeContextType as UIKitThemeContextType,
    UIKitThemeType,
} from '@gorgias/merchant-ui-kit'

import {THEME_TYPES} from './constants'

export type ThemeType = (typeof THEME_TYPES)[keyof typeof THEME_TYPES]

export type ThemeContextType = UIKitThemeContextType & {
    theme: UIKitThemeType
    savedTheme: ThemeType
    setTheme: (theme: ThemeType) => void
}

export type ThemeValue = {
    label: string
    settingsLabel?: string
    icon: string
    colorTokens: ThemeColors
}
