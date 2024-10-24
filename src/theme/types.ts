import dark from '@gorgias/design-tokens/dist/tokens/color/merchantDark.json'
import light from '@gorgias/design-tokens/dist/tokens/color/merchantLight.json'
import legacyColors from '@gorgias/design-tokens/dist/tokens/colors.json'

export enum Theme {
    System = 'system',
    Dark = 'dark',
    Light = 'light',
    Modern = 'modern light',
}

interface ThemeColorValue {
    value: string
}

export interface ThemeColors {
    Feedback: {
        Variations: {
            Error_0: ThemeColorValue
            Error_1: ThemeColorValue
            Error_2: ThemeColorValue
            Error_3: ThemeColorValue
            Error_4: ThemeColorValue
            Success_0: ThemeColorValue
            Success_1: ThemeColorValue
            Success_2: ThemeColorValue
            Success_3: ThemeColorValue
            Success_4: ThemeColorValue
            Warning_0: ThemeColorValue
            Warning_1: ThemeColorValue
            Warning_2: ThemeColorValue
            Warning_3: ThemeColorValue
            Warning_4: ThemeColorValue
        }
        Error: ThemeColorValue
        Success: ThemeColorValue
        Warning: ThemeColorValue
    }
    Main: {
        Variations: {
            Primary_0: ThemeColorValue
            Primary_1: ThemeColorValue
            Primary_2: ThemeColorValue
            Primary_3: ThemeColorValue
            Primary_4: ThemeColorValue
            Secondary_0: ThemeColorValue
            Secondary_1: ThemeColorValue
            Secondary_2: ThemeColorValue
        }
        Primary: ThemeColorValue
        Secondary: ThemeColorValue
        Latte: ThemeColorValue
    }
    Neutral: {
        Grey_0: ThemeColorValue
        Grey_1: ThemeColorValue
        Grey_2: ThemeColorValue
        Grey_3: ThemeColorValue
        Grey_4: ThemeColorValue
        Grey_5: ThemeColorValue
        Grey_6: ThemeColorValue
    }
    Accessory: {
        Blue_bg?: ThemeColorValue | undefined
        Blue_text?: ThemeColorValue | undefined
        Brown_text?: ThemeColorValue | undefined
        Green_bg?: ThemeColorValue | undefined
        Green_text?: ThemeColorValue | undefined
        Navy_text?: ThemeColorValue | undefined
        Orange_bg?: ThemeColorValue | undefined
        Pink_bg?: ThemeColorValue | undefined
        Purple_bg?: ThemeColorValue | undefined
        Purple_text?: ThemeColorValue | undefined
        Red_bg?: ThemeColorValue | undefined
        Teal_bg?: ThemeColorValue | undefined
        Yellow_bg?: ThemeColorValue | undefined
        Yellow_text?: ThemeColorValue | undefined
        Teal_3: ThemeColorValue
        Blue_3: ThemeColorValue
        Yellow_3: ThemeColorValue
        Green_3: ThemeColorValue
        Orange_3: ThemeColorValue
        Magenta_3: ThemeColorValue
        Teal_1: ThemeColorValue
        Red_1: ThemeColorValue
        Violet_1: ThemeColorValue
        Yellow_1: ThemeColorValue
        Green_1: ThemeColorValue
        Orange_1: ThemeColorValue
        Blue_1: ThemeColorValue
        Magenta_1: ThemeColorValue
        Red_3: ThemeColorValue
        Red_2: ThemeColorValue
        Teal_2: ThemeColorValue
        Magenta_2: ThemeColorValue
        Violet_3: ThemeColorValue
        Violet_2: ThemeColorValue
        Orange_2: ThemeColorValue
        Yellow_2: ThemeColorValue
        Green_2: ThemeColorValue
        Blue_2: ThemeColorValue
    }
}

export type ThemeValue = {
    label: string
    settingsLabel?: string
    icon: string
    colorTokens: ThemeColors
}

export const Themes: Record<Theme, ThemeValue> = {
    [Theme.System]: {
        label: 'Use system setting',
        settingsLabel: 'System',
        icon: 'computer',
        colorTokens: legacyColors['📺 Classic'] as unknown as ThemeColors,
    },
    [Theme.Dark]: {
        label: 'Dark',
        icon: 'dark_mode',
        colorTokens: dark.Dark,
    },
    [Theme.Light]: {
        label: 'Light',
        icon: 'brightness_high',
        colorTokens: light.Light,
    },
    [Theme.Modern]: {
        label: 'Classic',
        icon: 'brightness_6',
        colorTokens: legacyColors['🖥 Modern'] as unknown as ThemeColors,
    },
}

export type AcceptedThemes = Exclude<Theme, Theme.System>
