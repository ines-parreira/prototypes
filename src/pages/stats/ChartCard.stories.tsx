import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {TicketsCreatedDataItem} from 'fixtures/chart'

import ChartCard from './ChartCard'
import LineChart from './LineChart'

const storyConfig: Meta = {
    title: 'Stats/ChartCard',
    component: ChartCard,
}

const Template: Story<ComponentProps<typeof ChartCard>> = (props) => (
    <ChartCard {...props} />
)

const defaultProps: ComponentProps<typeof ChartCard> = {
    children: <div>Chart</div>,
    title: 'Tickets created',
    hint: 'This is a hint',
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithSingleLineChart = Template.bind({})
WithSingleLineChart.args = {
    children: <LineChart data={[TicketsCreatedDataItem]} hasBackground />,
    title: 'Tickets created',
    hint: 'This is a hint',
}

export default storyConfig
