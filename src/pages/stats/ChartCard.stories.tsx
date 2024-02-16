import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {ticketsCreatedDataItem} from 'fixtures/chart'

import ChartCard from './ChartCard'
import LineChart from './LineChart'

const storyConfig: Meta = {
    title: 'Stats/ChartCard',
    component: ChartCard,
    parameters: {
        chromatic: {
            disableSnapshot: false,
        },
    },
}

const Template: Story<ComponentProps<typeof ChartCard>> = (props) => (
    <ChartCard {...props} />
)

const defaultProps: ComponentProps<typeof ChartCard> = {
    children: <div>Chart</div>,
    title: 'Tickets created',
    hint: {title: 'This is a hint'},
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithSingleLineChart = Template.bind({})
WithSingleLineChart.args = {
    children: <LineChart data={[ticketsCreatedDataItem]} hasBackground />,
    title: 'Tickets created',
    hint: {title: 'This is a hint'},
}

export default storyConfig
