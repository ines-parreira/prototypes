import {Meta, Story} from '@storybook/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {MemoryRouter} from 'react-router-dom'

import {revenuePerAgent, ticketsClosedPerAgent} from 'fixtures/stats'

import TableStat from './TableStat'

const storyConfig: Meta = {
    title: 'Stats/TableStat',
    component: TableStat,
    decorators: [(story) => <MemoryRouter>{story()}</MemoryRouter>],
}

const Template: Story<ComponentProps<typeof TableStat>> = (props) => (
    <TableStat {...props} />
)

const defaultProps: ComponentProps<typeof TableStat> = {
    context: {tagColors: null},
    data: fromJS(revenuePerAgent.data.data),
    meta: fromJS(revenuePerAgent.meta),
    config: fromJS({}),
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithExpand = Template.bind({})
WithExpand.args = {
    ...defaultProps,
    data: fromJS(ticketsClosedPerAgent.data.data),
    meta: fromJS(ticketsClosedPerAgent.meta),
    config: fromJS({tableOptions: {showLines: 1}}),
}

export const NoData = Template.bind({})
NoData.args = {
    ...defaultProps,
    data: fromJS({lines: []}),
}

export default storyConfig
