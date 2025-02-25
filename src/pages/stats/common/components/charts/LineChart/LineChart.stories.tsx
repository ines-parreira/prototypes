import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import moment from 'moment'

import { ThemeProvider } from 'core/theme'
import { ticketsCreatedDataItem } from 'fixtures/chart'

import LineChart from './LineChart'

const storyConfig: Meta = {
    title: 'Stats/LineChart',
    component: LineChart,
}

const Template: StoryFn<ComponentProps<typeof LineChart>> = (
    props: ComponentProps<typeof LineChart>,
) => (
    <div style={{ height: '250px' }}>
        <ThemeProvider>
            <LineChart {...props} />
        </ThemeProvider>
    </div>
)

const defaultProps: ComponentProps<typeof LineChart> = {
    data: [ticketsCreatedDataItem],
    hasBackground: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

const generateRandomColor = () =>
    `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`

export const MultipleLines = Template.bind({})
MultipleLines.args = {
    ...defaultProps,
    data: new Array(10).fill(null).map((_, index) => ({
        label: `Line ${index + 1}`,
        values: new Array(15).fill(null).map((__, idx) => ({
            x: moment('01/01/2023', 'MM/DD/YYYY')
                .add(idx * 7, 'days')
                .format('MMM DD'),
            y: Math.floor(Math.random() * 100_000_000),
        })),
    })),
    hasBackground: false,
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
