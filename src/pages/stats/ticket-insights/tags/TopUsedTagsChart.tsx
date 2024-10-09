import React from 'react'
import {TrendIcon} from 'pages/stats/common/components/TrendIcon'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import ChartCard from 'pages/stats/ChartCard'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {
    NOT_AVAILABLE_PLACEHOLDER,
    formatMetricTrend,
    formatMetricValue,
} from 'pages/stats/common/utils'

import {useWidthBasedOnScreen} from 'hooks/useWidthBasedOnScreen'
import {DistributionCategoryCell} from 'pages/stats/DistributionCategoryCell'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

import useAppSelector from 'hooks/useAppSelector'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import {useTagsDistribution} from 'pages/stats/useTagsDistribution'
import {TagsMetric} from 'state/ui/stats/types'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import css from 'pages/stats/ticket-insights/tags/TopUsedTagsChart.less'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'pages/stats/common/components/TrendBadge'

export const TAGS_CARD_TITLE = 'Top used tags'
const TAGS_CARD_HINT =
    'Follow Ticket Fields filters with slight differences: \n - No “outside used” or “Total “ summarizing numbers\n - Columns show “Tags, Total, Delta” Changes at the header (this does not exist for TF)'

export const TopUsedTagsChart = () => {
    const {isFetching, data} = useTagsDistribution()

    const getWidth = useWidthBasedOnScreen()

    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )

    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )

    return (
        <ChartCard
            title={TAGS_CARD_TITLE}
            hint={{
                title: TAGS_CARD_HINT,
            }}
            className={css.card}
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
