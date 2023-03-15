import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {ticketsClosedDataItem, ticketsCreatedDataItem} from 'fixtures/chart'

import LineChart from './LineChart'

const storyConfig: Meta = {
    title: 'Stats/LineChart',
    component: LineChart,
}

const Template: Story<ComponentProps<typeof LineChart>> = (props) => (
    <div style={{height: '250px'}}>
        <LineChart {...props} />
    </div>
)

const defaultProps: ComponentProps<typeof LineChart> = {
    data: [ticketsCreatedDataItem],
    hasBackground: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

export const MultipleLines = Template.bind({})
MultipleLines.args = {
    ...defaultProps,
    data: [ticketsCreatedDataItem, ticketsClosedDataItem],
    hasBackground: false,
}

export default storyConfig
