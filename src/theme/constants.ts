import dark from '@gorgias/design-tokens/dist/tokens/color/merchantDark.json'
import light from '@gorgias/design-tokens/dist/tokens/color/merchantLight.json'
import legacyColors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {THEME_TYPES} from '@gorgias/merchant-ui-kit'

import type {ColorTokens, ThemeConfig, ThemeName} from './types'

const {Modern, ...UIKIT_THEME_TYPES} = THEME_TYPES
export const THEME_NAME = {
    ...UIKIT_THEME_TYPES,
    Classic: Modern,
    System: 'system',
} as const

export const themeTokenMap: Record<ThemeName, ColorTokens> = {
    [THEME_NAME.Classic]: legacyColors['🖥 Modern'] as unknown as ColorTokens,
    [THEME_NAME.Dark]: dark.Dark,
    [THEME_NAME.Light]: light.Light,
}

export const THEME_CONFIGS: ThemeConfig[] = [
    {
        icon: 'computer',
        label: 'Use system setting',
        name: 'system',
        settingsLabel: 'System',
    },
    {
        icon: 'dark_mode',
        label: 'Dark',
        name: THEME_NAME.Dark,
    },
    {
        icon: 'brightness_high',
        label: 'Light',
        name: THEME_NAME.Light,
    },
    {
        icon: 'brightness_6',
        label: 'Classic',
        name: THEME_NAME.Classic,
    },
] as const
