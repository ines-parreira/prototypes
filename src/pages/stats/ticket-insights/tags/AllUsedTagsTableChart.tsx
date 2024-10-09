import React from 'react'
import css from 'pages/stats/BreakdownTable.less'
import ChartCard from 'pages/stats/ChartCard'
import {AllUsedTagsTable} from 'pages/stats/ticket-insights/tags/AllUsedTagsTable'

const REPORT_TITLE = 'All used tags'
const REPORT_HINT =
    'Number of tickets labeled with each tag within the selected timeframe. Only tags that have been used at least once are shown.'

export const AllUsedTagsTableChart = () => {
    return (
        <ChartCard
            title={REPORT_TITLE}
            hint={{title: REPORT_HINT}}
            noPadding={true}
            className={css.limitedHeight}
        >
            <AllUsedTagsTable />
        </ChartCard>
    )
}
