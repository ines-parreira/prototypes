import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {TicketsClosedDataItem, TicketsCreatedDataItem} from 'fixtures/chart'

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
    data: [TicketsCreatedDataItem],
    hasBackground: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

export const MultipleLines = Template.bind({})
MultipleLines.args = {
    ...defaultProps,
    data: [TicketsCreatedDataItem, TicketsClosedDataItem],
    hasBackground: false,
}

export default storyConfig
