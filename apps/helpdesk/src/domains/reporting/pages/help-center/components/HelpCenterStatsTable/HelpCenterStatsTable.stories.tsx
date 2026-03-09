import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { HelpCenterTableCell } from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import HelpCenterStatsTable, {
    TableCellType,
} from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'

const meta: Meta<typeof HelpCenterStatsTable> = {
    title: 'Help Center Stats/HelpCenterStatsTable ',
    component: HelpCenterStatsTable,
    argTypes: {
        data: {
            table: {
                disable: true,
            },
        },
        columns: {
            table: {
                disable: true,
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof HelpCenterStatsTable>

const columns = [
    {
        type: TableCellType.String,
        name: 'Article',
    },
    {
        type: TableCellType.Number,
        name: 'Views',
    },
    {
        type: TableCellType.Percent,
        name: 'Rating',
    },
    {
        type: TableCellType.String,
        name: '+ | -',
    },
    {
        type: TableCellType.Date,
        name: 'last updated',
    },
]

const data: HelpCenterTableCell[][] = [
    [
        {
            type: TableCellType.String,
            value: 'What are AfterPay, Klarna and ShopPay Installments?',
        },
        {
            type: TableCellType.Number,
            value: 20000,
        },
        {
            type: TableCellType.Percent,
            value: 70,
        },
        {
            type: TableCellType.String,
            value: '10 | 3',
        },
        {
            type: TableCellType.Date,
            value: '2022-05-01T15:56:36+00:00',
        },
    ],
    [
        {
            type: TableCellType.String,
            value: 'How to start a return',
        },
        {
            type: TableCellType.Number,
            value: 15202,
        },
        {
            type: TableCellType.Percent,
            value: 65,
        },
        {
            type: TableCellType.String,
            value: '11 | 6',
        },
        {
            type: TableCellType.Date,
            value: '2021-12-01T15:56:36+00:00',
        },
    ],
]

export const Default: Story = {
    render: (args) => <HelpCenterStatsTable {...args} />,
    args: {
        columns,
        data,
        count: 10,
    },
}
