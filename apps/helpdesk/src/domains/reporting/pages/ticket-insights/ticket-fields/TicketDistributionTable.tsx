import { useWidthBasedOnScreen } from '@repo/hooks'
import Skeleton from 'react-loading-skeleton'

import colors from '@gorgias/design-tokens/tokens/colors'

import { useTicketsDistribution } from 'domains/reporting/hooks/ticket-insights/useTicketsDistribution'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import GaugeAddon from 'domains/reporting/pages/common/components/charts/GaugeAddon'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    DistributionCategoryCell,
    formatCategory,
} from 'domains/reporting/pages/ticket-insights/components/DistributionCategoryCell'
import css from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable.less'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { TicketFieldsMetric } from 'domains/reporting/state/ui/stats/types'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'

export const OUTSIDE_TOP_DATA = {
    title: 'Outside of Top used',
    color: colors.classic.accessory.purple_bg.value,
}

const LoadingFallback = () => {
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

type SelectedCustomField = {
    id: number
    label: string
}

const TicketDistributionTable = ({
    selectedCustomField,
}: {
    selectedCustomField: SelectedCustomField
}) => {
    const {
        isFetching,
        topData,
        ticketsCountTotal,
        outsideTopTotal,
        outsideTopTotalPercentage,
        outsideTopTotalGaugePercentage,
    } = useTicketsDistribution(selectedCustomField.id)

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const getWidth = useWidthBasedOnScreen()

    if (isFetching) {
        return <LoadingFallback />
    }

    if (topData.length === 0) {
        return <NoDataFallback />
    }

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
                                    ticketTimeReference:
                                        ticketFieldsTicketTimeReference,
                                }}
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
                    <BodyCell className={css.total} width={getWidth(320, 160)}>
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
                                ticketTimeReference:
                                    ticketFieldsTicketTimeReference,
                            }}
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

const useSelectedCustomField = () => {
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const selectedCustomFieldId = selectedCustomField.id
    if (selectedCustomFieldId === null) {
        return null
    }
    return {
        id: selectedCustomFieldId,
        label: selectedCustomField.label,
    }
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
            {selectedCustomField === null ? (
                <NoDataFallback />
            ) : (
                <TicketDistributionTable
                    selectedCustomField={selectedCustomField}
                />
            )}
        </ChartCard>
    )
}
