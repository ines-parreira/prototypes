import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { ticketsCreatedDataItem } from 'fixtures/chart'

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
