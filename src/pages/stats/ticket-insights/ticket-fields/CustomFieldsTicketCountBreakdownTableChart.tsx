import React from 'react'

import classNames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/BreakdownTable.less'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'
import { CustomFieldsTableHeatmapSwitch } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTableHeatmapSwitch'
import { CustomFieldsTicketCountBreakdownTable } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { TicketInsightsValueModeSwitch } from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsValueModeSwitch'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'

export const CustomFieldsTicketCountBreakdownTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { id, label } = useAppSelector(getSelectedCustomField)

    const { hint, title } =
        TicketInsightsFieldsMetricConfig[
            TicketInsightsFieldsMetric.CustomFieldsTicketCountBreakdown
        ]

    return (
        <ChartCard
            title={title}
            hint={hint}
            noPadding={true}
            className={css.limitedHeight}
            dashboard={dashboard}
            chartId={chartId}
            titleExtra={
                <div className={css.switches}>
                    <TicketInsightsValueModeSwitch />
                    <CustomFieldsTableHeatmapSwitch />
                </div>
            }
        >
            {id !== null ? (
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomField={{
                        id: id,
                        label,
                    }}
                />
            ) : (
                <NoDataAvailable
                    className={classNames(
                        css.NoDataAvailable,
                        css.limitedHeight,
                    )}
                />
            )}
        </ChartCard>
    )
}
