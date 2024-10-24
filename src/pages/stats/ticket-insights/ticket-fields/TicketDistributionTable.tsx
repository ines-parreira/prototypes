import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import React from 'react'

import {useTicketsDistribution} from 'hooks/reporting/useTicketsDistribution'
import {useWidthBasedOnScreen} from 'hooks/useWidthBasedOnScreen'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ChartCard from 'pages/stats/ChartCard'
import {
    NOT_AVAILABLE_PLACEHOLDER,
    formatMetricValue,
} from 'pages/stats/common/utils'
import {
    DistributionCategoryCell,
    formatCategory,
} from 'pages/stats/DistributionCategoryCell'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import GaugeAddon from 'pages/stats/GaugeAddon'

import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'
import {TicketFieldsMetric} from 'state/ui/stats/types'

export const OUTSIDE_TOP_DATA = {
    title: 'Outside of Top used',
    color: colors['📺 Classic'].Accessory.Purple_bg.value,
}

export const TicketDistributionTable = ({
    selectedCustomField,
    isAnalyticsNewFilters = false,
}: {
    selectedCustomField: {id: number; label: string}
    isAnalyticsNewFilters?: boolean
}) => {
    const {
        isFetching,
        topData,
        ticketsCountTotal,
        outsideTopTotal,
        outsideTopTotalPercentage,
        outsideTopTotalGaugePercentage,
    } = useTicketsDistribution()

    const getWidth = useWidthBasedOnScreen()

    return (
        <ChartCard
            title="Top used values"
            hint={{
                title: 'Top 10 used values, as well as the number of tickets that were labeled with one of these values within the selected timeframe for the selected Ticket Field. All other values are grouped in the “Outside of Top used”.',
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
                        <TableBodyRow className={css.lastRow}>
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
            ) : topData.length > 0 ? (
                <TableWrapper className={css.table}>
                    <TableBody>
                        {topData.map((item, index) => (
                            <TableBodyRow key={index}>
                                <DistributionCategoryCell
                                    key={item.category}
                                    progress={item.gaugePercentage}
                                    width={getWidth(320, 160)}
                                    category={item.category}
                                />
                                <BodyCell justifyContent="right" width={80}>
                                    <DrillDownModalTrigger
                                        metricData={{
                                            title: `${
                                                selectedCustomField.label
                                            } | ${formatCategory(
                                                item.category
                                            )}`,
                                            metricName:
                                                TicketFieldsMetric.TicketCustomFieldsTicketCount,
                                            customFieldId:
                                                selectedCustomField.id,
                                            customFieldValue: [item.category],
                                        }}
                                        useNewFilterData={isAnalyticsNewFilters}
                                    >
                                        {formatMetricValue(
                                            item.value,
                                            'decimal',
                                            NOT_AVAILABLE_PLACEHOLDER
                                        )}
                                    </DrillDownModalTrigger>
                                </BodyCell>
                                <BodyCell justifyContent="right" width={80}>
                                    {formatMetricValue(
                                        item.valueInPercentage,
                                        'percent-refined',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                            </TableBodyRow>
                        ))}

                        {outsideTopTotal ? (
                            <TableBodyRow>
                                <BodyCell justifyContent="left">
                                    <GaugeAddon
                                        progress={
                                            outsideTopTotalGaugePercentage
                                        }
                                        color={OUTSIDE_TOP_DATA.color}
                                    >
                                        {OUTSIDE_TOP_DATA.title}
                                    </GaugeAddon>
                                </BodyCell>
                                <BodyCell justifyContent="right" width={80}>
                                    {formatMetricValue(
                                        outsideTopTotal,
                                        'decimal',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                                <BodyCell justifyContent="right" width={80}>
                                    {formatMetricValue(
                                        outsideTopTotalPercentage,
                                        'percent-refined',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                            </TableBodyRow>
                        ) : null}

                        <TableBodyRow className={css.lastRow}>
                            <BodyCell
                                className={css.total}
                                width={getWidth(320, 160)}
                            >
                                Total
                            </BodyCell>
                            <BodyCell justifyContent="right" width={80}>
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: `${selectedCustomField.label} | Total`,
                                        metricName:
                                            TicketFieldsMetric.TicketCustomFieldsTicketCount,
                                        customFieldId: selectedCustomField.id,
                                        customFieldValue: null,
                                    }}
                                    useNewFilterData={isAnalyticsNewFilters}
                                >
                                    {formatMetricValue(ticketsCountTotal)}
                                </DrillDownModalTrigger>
                            </BodyCell>
                            <BodyCell justifyContent="right" width={80}>
                                100%
                            </BodyCell>
                        </TableBodyRow>
                    </TableBody>
                </TableWrapper>
            ) : (
                <NoDataAvailable style={{minHeight: 300}} />
            )}
        </ChartCard>
    )
}
