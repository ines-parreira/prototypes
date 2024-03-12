import React, {ComponentType, useContext} from 'react'
import ThemeContext from 'theme/ThemeContext'
import {Theme} from 'theme/types'
import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import analyticsColorsLight from 'assets/css/new/stats/light.json'
import analyticsColorsDark from 'assets/css/new/stats/dark.json'

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

const AnalyticsColorTokens: Record<Theme, AnalyticsTheme> = {
    [Theme.System]: analyticsColorsModern,
    [Theme.Modern]: analyticsColorsModern,
    [Theme.Light]: analyticsColorsLight,
    [Theme.Dark]: analyticsColorsDark,
}

export const withAnalyticsTheme = <P extends object>(
    Component: ComponentType<P>
) => {
    return (props: P) => {
        const themeContext = useContext(ThemeContext)
        const analyticsTheme =
            AnalyticsColorTokens[themeContext?.theme ?? Theme.Modern]
        const colorTokens = themeContext
            ? {...themeContext.colorTokens, ...analyticsTheme}
            : undefined

        return <Component {...props} colorTokens={colorTokens} />
    }
}
