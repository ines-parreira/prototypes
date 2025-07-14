import { fromJS } from 'immutable'

import colors from '@gorgias/design-tokens/tokens/colors'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { ChartColors } from 'domains/reporting/pages/common/components/charts/types'
import type { AnalyticsTheme } from 'domains/reporting/pages/common/theme'

export const chartColorsFallbackTokens = {
    Main: {
        Primary: {
            value: colors.classic.main.primary.value,
        },
    },
    Feedback: {
        Error: { value: colors.classic.feedback.error.value },
        Success: { value: colors.classic.feedback.success.value },
        Warning: { value: colors.classic.feedback.warning.value },
    },
    Neutral: {
        Grey_2: {
            value: colors.classic.neutral.grey_2.value,
        },
        Grey_5: {
            value: colors.classic.neutral.grey_5.value,
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
