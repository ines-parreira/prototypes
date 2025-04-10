import classNames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
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
