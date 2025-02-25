import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import moment from 'moment'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { ticketsCreatedDataItem } from 'fixtures/chart'
import type { AnalyticsTheme } from 'pages/stats/common/theme'

import { ChartColors } from '../types'
import { BarChart } from './BarChart'

const storyConfig: Meta = {
    title: 'Stats/BarChart',
    component: BarChart,
}

const Template: StoryFn<ComponentProps<typeof BarChart>> = (
    props: ComponentProps<typeof BarChart>,
) => (
    <div style={{ height: '250px' }}>
        <BarChart {...props} />
    </div>
)

const defaultProps: ComponentProps<typeof BarChart> = {
    data: [ticketsCreatedDataItem],
    hasBackground: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

export const MultipleLinesWithColorsFromDesign = Template.bind({})
MultipleLinesWithColorsFromDesign.args = {
    ...defaultProps,
    data: new Array(3).fill(null).map((_, index) => ({
        label: `Line ${index + 1}`,
        values: new Array(7).fill(null).map((__, idx) => ({
            x: moment('01/01/2023', 'MM/DD/YYYY')
                .add(idx * 7, 'days')
                .format('MMM DD'),
            y: Math.floor(Math.random() * 100_000_000),
        })),
    })),
}

export const MultipleLinesWithColorsFromDesignStacked = Template.bind({})
const stackedColors = {
    analytics: {
        data: {
            ...analyticsColorsModern.analytics.data,
            blue: {
                value: analyticsColorsModern.analytics.data.grey.value,
            },
            yellow: {
                value: analyticsColorsModern.analytics.data.blue.value,
            },
            grey: {
                value: analyticsColorsModern.analytics.data.yellow.value,
            },
        },
        heatmap: analyticsColorsModern.analytics.heatmap,
    },
} as ChartColors & AnalyticsTheme
MultipleLinesWithColorsFromDesignStacked.args = {
    ...defaultProps,
    data: new Array(3).fill(null).map((_, index) => ({
        label: `Line ${index + 1}`,
        values: new Array(7).fill(null).map((__, idx) => ({
            x: moment('01/01/2023', 'MM/DD/YYYY')
                .add(idx * 7, 'days')
                .format('MMM DD'),
            y: Math.floor(Math.random() * 100_000_000),
        })),
    })),
    colorTokens: stackedColors,
    options: {
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    },
}

const generateRandomColor = () =>
    `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`

export const MultipleLines = Template.bind({})
MultipleLines.args = {
    ...defaultProps,
    data: new Array(3).fill(null).map((_, index) => ({
        label: `Line ${index + 1}`,
        values: new Array(7).fill(null).map((__, idx) => ({
            x: moment('01/01/2023', 'MM/DD/YYYY')
                .add(idx * 7, 'days')
                .format('MMM DD'),
            y: Math.floor(Math.random() * 100_000_000),
        })),
    })),
    customColors: new Array(15).fill(null).map(() => generateRandomColor()),
    options: {
        elements: {
            point: {
                radius: 0,
            },
            line: {
                tension: 0,
            },
        },
    },
}

export default storyConfig
