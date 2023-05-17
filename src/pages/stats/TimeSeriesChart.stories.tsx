import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {ReportingGranularity} from '../../models/reporting/types'
import TimeSeriesChart from './TimeSeriesChart'

const ticketsCreatedDataItem = [
    [
        {dateTime: '2022-04-01T00:00:00.000', value: 1140},
        {dateTime: '2022-05-01T00:00:00.000', value: 11377},
        {dateTime: '2022-06-01T00:00:00.000', value: 9824},
        {dateTime: '2022-07-01T00:00:00.000', value: 10722},
        {dateTime: '2022-08-01T00:00:00.000', value: 15288},
        {dateTime: '2022-09-01T00:00:00.000', value: 16604},
        {dateTime: '2022-10-01T00:00:00.000', value: 14154},
        {dateTime: '2022-11-01T00:00:00.000', value: 23508},
        {dateTime: '2022-12-01T00:00:00.000', value: 32023},
        {dateTime: '2023-01-01T00:00:00.000', value: 31198},
        {dateTime: '2023-02-01T00:00:00.000', value: 26429},
        {dateTime: '2023-03-01T00:00:00.000', value: 17033},
        {dateTime: '2023-04-01T00:00:00.000', value: 11778},
    ],
]
const storyConfig: Meta = {
    title: 'Stats/TimeSeriesChart',
    component: TimeSeriesChart,
}

const Template: Story<ComponentProps<typeof TimeSeriesChart>> = (props) => (
    <div style={{height: '250px'}}>
        <TimeSeriesChart {...props} />
    </div>
)

const defaultProps: ComponentProps<typeof TimeSeriesChart> = {
    timeSeries: {data: ticketsCreatedDataItem},
    labels: [],
    granularity: ReportingGranularity.Month,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
