import { useWidthBasedOnScreen } from '@repo/hooks'
import { TrendIcon } from '@repo/reporting'

import { Skeleton } from '@gorgias/axiom'

import { useTagsDistribution } from 'domains/reporting/hooks/support-performance/useTagsDistribution'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricTrend,
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { DistributionCategoryCell } from 'domains/reporting/pages/ticket-insights/components/DistributionCategoryCell'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/tags/TagsMetricConfig'
import css from 'domains/reporting/pages/ticket-insights/tags/TopUsedTagsChart.less'
import { TagsMetric } from 'domains/reporting/state/ui/stats/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'

export const LoadingTable = () => {
    return (
        <TableWrapper className={css.table}>
            <TableBody>
                {Array.from({ length: 10 }, (_, rowIndex) => (
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
    )
}

export const TopUsedTagsChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isFetching, data } = useTagsDistribution()

    const [tagTicketTimeReference] = useTicketTimeReference(Entity.Tag)

    const getWidth = useWidthBasedOnScreen()

    const { hint, title } =
        TicketInsightsTagsMetricConfig[
            TicketInsightsTagsMetric.TopUsedTagsChart
        ]

    return (
        <ChartCard
            title={title}
            hint={hint}
            className={css.card}
            dashboard={dashboard}
            chartId={chartId}
            noPadding={true}
        >
            {isFetching ? (
                <LoadingTable />
            ) : data.length === 0 ? (
                <NoDataAvailable style={{ minHeight: 300 }} />
            ) : (
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
                            const { formattedTrend, sign = 0 } =
                                formatMetricTrend(
                                    item.valueInPercentage,
                                    item.previousValueInPercentage,
                                    TREND_BADGE_FORMAT,
                                )
                            return (
                                <TableBodyRow key={index}>
                                    <DistributionCategoryCell
                                        key={item.category}
                                        progress={item.gaugePercentage}
                                        width={getWidth(300, 140)}
                                        category={item.name}
                                        justifyContent="left"
                                        innerStyle={{ paddingLeft: 0 }}
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
                                                    tagId: item.category.toString(),
                                                    ticketTimeReference:
                                                        tagTicketTimeReference,
                                                }}
                                            >
                                                {formatMetricValue(
                                                    item.value,
                                                    'decimal',
                                                    NOT_AVAILABLE_PLACEHOLDER,
                                                )}
                                            </DrillDownModalTrigger>
                                        )}
                                    </BodyCell>
                                    <BodyCell
                                        justifyContent="center"
                                        width={65}
                                    >
                                        <TrendIcon value={sign} />
                                        {formattedTrend || DEFAULT_BADGE_TEXT}
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        })}
                    </TableBody>
                </TableWrapper>
            )}
        </ChartCard>
    )
}
