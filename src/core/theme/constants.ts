import { THEME_NAME } from '@gorgias/design-tokens'

import type { HelpdeskThemeName } from './types'

type ThemeConfig = {
    icon: string
    label: string
    name: HelpdeskThemeName
    settingsLabel?: string
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
