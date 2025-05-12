import type { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import { ticketsCreatedDataItem } from 'fixtures/chart'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'

import ChartCard from './ChartCard'

const storyConfig: Meta = {
    title: 'Stats/ChartCard',
    component: ChartCard,
    parameters: {
        chromatic: {
            disableSnapshot: false,
        },
    },
}

type Story = StoryObj<typeof ChartCard>

const Template: Story = {
    render: (props) => <ChartCard {...props} />,
}

const defaultProps: ComponentProps<typeof ChartCard> = {
    children: <div>Chart</div>,
    title: 'Tickets created',
    hint: { title: 'This is a hint' },
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const WithSingleLineChart = {
    ...Template,
    args: {
        children: <LineChart data={[ticketsCreatedDataItem]} hasBackground />,
        title: 'Tickets created',
        hint: { title: 'This is a hint' },
    },
}

export default storyConfig
