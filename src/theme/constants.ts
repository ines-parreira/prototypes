import dark from '@gorgias/design-tokens/dist/tokens/color/merchantDark.json'
import light from '@gorgias/design-tokens/dist/tokens/color/merchantLight.json'
import legacyColors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {
    THEME_TYPES as UIKIT_THEME_TYPES,
    ThemeColors,
} from '@gorgias/merchant-ui-kit'

import {ThemeType, ThemeValue} from './types'

export const THEME_TYPES = {
    ...UIKIT_THEME_TYPES,
    System: 'system',
} as const

export const THEMES: Record<ThemeType, ThemeValue> = {
    [THEME_TYPES.System]: {
        label: 'Use system setting',
        settingsLabel: 'System',
        icon: 'computer',
        colorTokens: legacyColors['📺 Classic'] as unknown as ThemeColors,
    },
    [THEME_TYPES.Dark]: {
        label: 'Dark',
        icon: 'dark_mode',
        colorTokens: dark.Dark,
    },
    [THEME_TYPES.Light]: {
        label: 'Light',
        icon: 'brightness_high',
        colorTokens: light.Light,
    },
    [THEME_TYPES.Modern]: {
        label: 'Classic',
        icon: 'brightness_6',
        colorTokens: legacyColors['🖥 Modern'] as unknown as ThemeColors,
    },
} as const
