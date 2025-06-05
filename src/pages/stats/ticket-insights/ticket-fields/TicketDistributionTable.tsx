import colors from '@gorgias/design-tokens/tokens/colors'

import { useTicketsDistribution } from 'hooks/reporting/ticket-insights/useTicketsDistribution'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import useAppSelector from 'hooks/useAppSelector'
import { useWidthBasedOnScreen } from 'hooks/useWidthBasedOnScreen'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ChartCard from 'pages/stats/common/components/ChartCard'
import GaugeAddon from 'pages/stats/common/components/charts/GaugeAddon'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import {
    DistributionCategoryCell,
    formatCategory,
} from 'pages/stats/ticket-insights/components/DistributionCategoryCell'
import { TableLoadingFallback } from 'pages/stats/ticket-insights/ticket-fields/TableLoadingFallback'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'
import { TicketFieldsMetric } from 'state/ui/stats/types'

export const OUTSIDE_TOP_DATA = {
    title: 'Outside of Top used',
    color: colors.classic.accessory.purple_bg.value,
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
        return <TableLoadingFallback />
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
