import classNames from 'classnames'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { CustomFieldsTableHeatmapSwitch } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTableHeatmapSwitch'
import { CustomFieldsTicketCountBreakdownTable } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { TicketInsightsValueModeSwitch } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsValueModeSwitch'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'

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
