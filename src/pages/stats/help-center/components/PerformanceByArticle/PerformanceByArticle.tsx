import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import HelpCenterStatsTable, {
    HelpCenterTableCell,
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'

const columns = [
    {
        type: TableCellType.String,
        name: 'Article',
        width: 594,
    },
    {
        type: TableCellType.Number,
        name: 'Views',
        tooltip: {
            title: 'Total number of views, including duplicate views by the same user',
        },
    },
    {
        type: TableCellType.Percent,
        name: 'Rating',
        tooltip: {
            title: 'Quality of article calculated by: (# of positive reactions / (total # of reactions)) * 100 across all time',
        },
    },
    {
        type: TableCellType.String,
        name: '👍 | 👎',
        tooltip: {
            title: 'Number of positive reactions compared to negative',
        },
    },
    {
        type: TableCellType.Date,
        name: 'last updated',
        width: 150,
        tooltip: {
            title: 'The most recent date the article was edited',
        },
    },
]

const data: HelpCenterTableCell[][] = [
    [
        {
            type: TableCellType.String,
            value: 'What are AfterPay, Klarna and ShopPay Installments?',
            link: 'http://acme.gorgias.docker/app/stats/help-center',
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
            value: 'What forms of payment are accepted for online purchases, and when will I know w What forms of payment are accepted for online purchases, and when will I know w... What forms of payment are accepted for online purchases, and when will I know',
            link: 'http://acme.gorgias.docker/app/stats/help-center',
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
    [
        {
            type: TableCellType.String,
            value: 'What forms of payment are accepted for online purchases, and when will I know w What forms of payment are accepted for online purchases, and when will I know w... What forms of payment are accepted for online purchases, and when will I know',
            link: 'http://acme.gorgias.docker/app/stats/help-center',
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

const PAGES_COUNT = 10
const ITEMS_PER_PAGE = 20

export const PerformanceByArticle = () => {
    const [currentPage, setCurrentPage] = React.useState(1)

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    return (
        <ChartCard title="Performance by articles" noPadding>
            <HelpCenterStatsTable
                onPageChange={onPageChange}
                currentPage={currentPage}
                count={PAGES_COUNT}
                pageSize={ITEMS_PER_PAGE}
                columns={columns}
                data={data}
            />
        </ChartCard>
    )
}
