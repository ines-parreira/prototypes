import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useTicketsDistribution } from 'hooks/reporting/useTicketsDistribution'
import useAppSelector from 'hooks/useAppSelector'
import { useWidthBasedOnScreen } from 'hooks/useWidthBasedOnScreen'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ChartCard from 'pages/stats/ChartCard'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import {
    DistributionCategoryCell,
    formatCategory,
} from 'pages/stats/DistributionCategoryCell'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import GaugeAddon from 'pages/stats/GaugeAddon'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'
import { TicketFieldsMetric } from 'state/ui/stats/types'

export const OUTSIDE_TOP_DATA = {
    title: 'Outside of Top used',
    color: colors['📺 Classic'].Accessory.Purple_bg.value,
}

const LoadingFallback = () => {
    return (
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
    )
}

const NoDataFallback = () => {
    return <NoDataAvailable style={{ minHeight: 300 }} />
}

const useIsAnalyticsNewFilters = () => {
    return !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
}

type CustomField = Omit<ReturnType<typeof getSelectedCustomField>, 'isLoading'>

const TicketDistributionTable = ({
    selectedCustomField,
}: {
    selectedCustomField: CustomField
}) => {
    const isAnalyticsNewFilters = useIsAnalyticsNewFilters()

    const {
        isFetching,
        topData,
        ticketsCountTotal,
        outsideTopTotal,
        outsideTopTotalPercentage,
        outsideTopTotalGaugePercentage,
    } = useTicketsDistribution()

    const getWidth = useWidthBasedOnScreen()

    if (isFetching) {
        return <LoadingFallback />
    }

    if (topData.length > 0) {
        return (
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
                                    highlighted
                                    metricData={{
                                        title: `${
                                            selectedCustomField.label
                                        } | ${formatCategory(item.category)}`,
                                        metricName:
                                            TicketFieldsMetric.TicketCustomFieldsTicketCount,
                                        customFieldId: selectedCustomField.id,
                                        customFieldValue: [item.category],
                                    }}
                                    useNewFilterData={isAnalyticsNewFilters}
                                >
                                    {formatMetricValue(
                                        item.value,
                                        'decimal',
                                        NOT_AVAILABLE_PLACEHOLDER,
                                    )}
                                </DrillDownModalTrigger>
                            </BodyCell>
                            <BodyCell justifyContent="right" width={80}>
                                {formatMetricValue(
                                    item.valueInPercentage,
                                    'percent-refined',
                                    NOT_AVAILABLE_PLACEHOLDER,
                                )}
                            </BodyCell>
                        </TableBodyRow>
                    ))}

                    {outsideTopTotal ? (
                        <TableBodyRow>
                            <BodyCell justifyContent="left">
                                <GaugeAddon
                                    progress={outsideTopTotalGaugePercentage}
                                    color={OUTSIDE_TOP_DATA.color}
                                >
                                    {OUTSIDE_TOP_DATA.title}
                                </GaugeAddon>
                            </BodyCell>
                            <BodyCell justifyContent="right" width={80}>
                                {formatMetricValue(
                                    outsideTopTotal,
                                    'decimal',
                                    NOT_AVAILABLE_PLACEHOLDER,
                                )}
                            </BodyCell>
                            <BodyCell justifyContent="right" width={80}>
                                {formatMetricValue(
                                    outsideTopTotalPercentage,
                                    'percent-refined',
                                    NOT_AVAILABLE_PLACEHOLDER,
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
                                highlighted
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
        )
    }

    return <NoDataFallback />
}

const useSelectedCustomField = () => {
    return useAppSelector(getSelectedCustomField)
}

export const TicketDistributionChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const selectedCustomField = useSelectedCustomField()

    const { hint, title } =
        TicketInsightsFieldsMetricConfig[
            TicketInsightsFieldsMetric.TicketDistribution
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
            {selectedCustomField.id == null ? (
                <NoDataFallback />
            ) : (
                <TicketDistributionTable
                    selectedCustomField={selectedCustomField}
                />
            )}
        </ChartCard>
    )
}
