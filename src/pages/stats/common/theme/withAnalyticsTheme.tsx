import React, {ComponentType, useMemo} from 'react'

import analyticsColorsDark from 'assets/css/new/stats/dark.json'
import analyticsColorsLight from 'assets/css/new/stats/light.json'
import analyticsColorsModern from 'assets/css/new/stats/modern.json'

import {THEME_NAME, useTheme} from 'theme'
import type {ThemeName} from 'theme'

interface ThemeColorValue {
    value: string
}

export interface AnalyticsTheme {
    analytics: {
        data: {
            blue: ThemeColorValue
            yellow: ThemeColorValue
            magenta: ThemeColorValue
            brown: ThemeColorValue
            'dark-blue': ThemeColorValue
            'dark-brown': ThemeColorValue
            grey: ThemeColorValue
            turquoise: ThemeColorValue
            indigo: ThemeColorValue
            pink: ThemeColorValue
        }
        heatmap: {
            'heatmap-0': ThemeColorValue
            'heatmap-1': ThemeColorValue
            'heatmap-2': ThemeColorValue
            'heatmap-3': ThemeColorValue
            'heatmap-4': ThemeColorValue
            'heatmap-5': ThemeColorValue
            'heatmap-6': ThemeColorValue
            'heatmap-7': ThemeColorValue
            'heatmap-8': ThemeColorValue
            'heatmap-9': ThemeColorValue
        }
    }
}

const AnalyticsColorTokens: Record<ThemeName, AnalyticsTheme> = {
    [THEME_NAME.Classic]: analyticsColorsModern,
    [THEME_NAME.Dark]: analyticsColorsDark,
    [THEME_NAME.Light]: analyticsColorsLight,
}

export default function withAnalyticsTheme<P extends object>(
    Component: ComponentType<P>
) {
    return (props: P) => {
        const theme = useTheme()
        const colorTokens = useMemo(
            () => ({
                ...theme.tokens,
                ...AnalyticsColorTokens[theme.resolvedName],
            }),
            [theme]
        )

        return <Component {...props} colorTokens={colorTokens} />
    }
}
