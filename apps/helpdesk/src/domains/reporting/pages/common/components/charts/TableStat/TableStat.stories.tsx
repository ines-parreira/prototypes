import type { ComponentProps } from 'react'

import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TableStat from 'domains/reporting/pages/common/components/charts/TableStat/TableStat'
import { revenuePerAgent, ticketsClosedPerAgent } from 'fixtures/stats'

const storyConfig: Meta = {
    title: 'Stats/TableStat',
    component: TableStat,
    decorators: [(story) => <MemoryRouter>{story()}</MemoryRouter>],
}

type Story = StoryObj<typeof TableStat>

const Template: Story = {
    render: (props) => <TableStat {...props} />,
}

const defaultProps: ComponentProps<typeof TableStat> = {
    context: { tagColors: null },
    data: fromJS(revenuePerAgent.data.data),
    meta: fromJS(revenuePerAgent.meta),
    config: fromJS({}),
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const WithExpand = {
    ...Template,
    args: {
        ...defaultProps,
        data: fromJS(ticketsClosedPerAgent.data.data),
        meta: fromJS(ticketsClosedPerAgent.meta),
        config: fromJS({ tableOptions: { showLines: 1 } }),
    },
}

export const NoData = {
    ...Template,
    args: {
        ...defaultProps,
        data: fromJS({ lines: [] }),
    },
}

export default storyConfig
