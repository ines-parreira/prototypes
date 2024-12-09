import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {fromJS} from 'immutable'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import type {AnalyticsTheme} from 'pages/stats/common/theme'

import {ChartColors} from './types'

export const chartColorsFallbackTokens = {
    Main: {
        Primary: {
            value: colors['📺 Classic'].Main.Primary.value,
        },
    },
    Feedback: {
        Error: {value: colors['📺 Classic'].Feedback.Error.value},
        Success: {value: colors['📺 Classic'].Feedback.Success.value},
        Warning: {value: colors['📺 Classic'].Feedback.Warning.value},
    },
    Neutral: {
        Grey_2: {
            value: colors['📺 Classic'].Neutral.Grey_2.value,
        },
        Grey_5: {
            value: colors['📺 Classic'].Neutral.Grey_5.value,
        },
    },
    ...analyticsColorsModern,
}

export const OPTIONS = (colorTokens: ChartColors & AnalyticsTheme): unknown =>
    fromJS({
        elements: {
            point: {
                pointStyle: 'circle',
            },
            line: {
                borderWidth: 1,
                cubicInterpolationMode: 'default',
                tension: 0.5,
            },
        },
        layout: {
            padding: {
                bottom: -8,
            },
        },
        responsive: true,
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: colorTokens.Neutral.Grey_5.value,
                    font: {
                        size: 12,
                    },
                    padding: 8,
                    autoSkipPadding: 24,
                    maxRotation: 0,
                    includeBounds: false,
                },
            },
            y: {
                title: {
                    display: false,
                },
                border: {
                    display: false,
                },
                grid: {
                    color: colorTokens.Neutral.Grey_2.value,
                    tickColor: 'transparent',
                    tickLength: 16,
                },
                ticks: {
                    color: colorTokens.Neutral.Grey_5.value,
                    font: {
                        size: 12,
                    },
                    maxTicksLimit: 10,
                },
                suggestedMin: 0,
                beginAtZero: true,
            },
        },
        plugins: {
            filler: {
                propagate: false,
            },
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                callbacks: {
                    title: () => undefined, // reset legacy tooltip title
                },
            },
        },
        maintainAspectRatio: false,
        resizeDelay: 1000,
    })

export const barChartStackedOptionsOverrides = {
    scales: {
        y: {
            stacked: true,
        },
        x: {
            stacked: true,
        },
    },
}
