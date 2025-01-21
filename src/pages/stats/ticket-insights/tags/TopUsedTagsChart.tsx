import React from 'react'

import {useTagsDistribution} from 'hooks/reporting/support-performance/useTagsDistribution'
import {useWidthBasedOnScreen} from 'hooks/useWidthBasedOnScreen'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ChartCard from 'pages/stats/ChartCard'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'pages/stats/common/components/TrendBadge'
import {TrendIcon} from 'pages/stats/common/components/TrendIcon'
import {
    NOT_AVAILABLE_PLACEHOLDER,
    formatMetricTrend,
    formatMetricValue,
} from 'pages/stats/common/utils'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {DistributionCategoryCell} from 'pages/stats/DistributionCategoryCell'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'pages/stats/ticket-insights/tags/TagsMetricConfig'
import css from 'pages/stats/ticket-insights/tags/TopUsedTagsChart.less'
import {TagsMetric} from 'state/ui/stats/types'

export const TopUsedTagsChart = ({chartId}: DashboardChartProps) => {
    const {isFetching, data} = useTagsDistribution()

    const getWidth = useWidthBasedOnScreen()

    const {hint, title} =
        TicketInsightsTagsMetricConfig[
            TicketInsightsTagsMetric.TopUsedTagsChart
        ]

    return (
        <ChartCard
            title={title}
            hint={hint}
            className={css.card}
            chartId={chartId}
        >
            {isFetching ? (
                <TableWrapper className={css.table}>
                    <TableBody>
                        {new Array(10).fill(null).map((_, rowIndex) => (
                            <TableBodyRow key={rowIndex}>
                                <BodyCell>
                                    <Skeleton inline width={260} />
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    <Skeleton inline width={65} />
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    <Skeleton inline width={40} />
                                </BodyCell>
                            </TableBodyRow>
                        ))}
                        <TableBodyRow>
                            <BodyCell>
                                <Skeleton width={260} />
                            </BodyCell>
                            <BodyCell justifyContent="right">
                                <Skeleton width={65} />
                            </BodyCell>
                            <BodyCell justifyContent="right">
                                <Skeleton width={40} />
                            </BodyCell>
                        </TableBodyRow>
                    </TableBody>
                </TableWrapper>
            ) : data.length > 0 ? (
                <TableWrapper className={css.table}>
                    <TableBody>
                        <TableBodyRow>
                            <BodyCell
                                justifyContent="left"
                                width={300}
                                className={css.bodyCell}
                            >
                                Tags
                            </BodyCell>
                            <BodyCell
                                justifyContent="center"
                                width={65}
                                className={css.bodyCell}
                            >
                                Total
                            </BodyCell>
                            <BodyCell
                                justifyContent="center"
                                width={65}
                                className={css.bodyCell}
                            >
                                Delta
                            </BodyCell>
                        </TableBodyRow>
                        {data.map((item, index) => {
                            const {formattedTrend, sign = 0} =
                                formatMetricTrend(
                                    item.valueInPercentage,
                                    item.previousValueInPercentage,
                                    TREND_BADGE_FORMAT
                                )
                            return (
                                <TableBodyRow key={index}>
                                    <DistributionCategoryCell
                                        key={item.category}
                                        progress={item.gaugePercentage}
                                        width={getWidth(300, 140)}
                                        category={item.name}
                                        justifyContent="left"
                                        innerStyle={{paddingLeft: 0}}
                                        innerClassName={css.bodyCellContent}
                                    />
                                    <BodyCell
                                        justifyContent="center"
                                        width={65}
                                    >
                                        {item.category && (
                                            <DrillDownModalTrigger
                                                metricData={{
                                                    title: `Total | ${item.name}`,
                                                    metricName:
                                                        TagsMetric.TicketCount,
                                                    tagId: item.category,
                                                }}
                                                useNewFilterData
                                            >
                                                {formatMetricValue(
                                                    item.value,
                                                    'decimal',
                                                    NOT_AVAILABLE_PLACEHOLDER
                                                )}
                                            </DrillDownModalTrigger>
                                        )}
                                    </BodyCell>
                                    <BodyCell
                                        justifyContent="center"
                                        width={65}
                                    >
                                        <TrendIcon sign={sign} />
                                        {formattedTrend || DEFAULT_BADGE_TEXT}
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        })}
                    </TableBody>
                </TableWrapper>
            ) : (
                <NoDataAvailable style={{minHeight: 300}} />
            )}
        </ChartCard>
    )
}
