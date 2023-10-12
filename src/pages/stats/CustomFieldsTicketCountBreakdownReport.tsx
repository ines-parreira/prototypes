import React from 'react'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/BreakdownTable.less'
import ChartCard from 'pages/stats/ChartCard'
import {CustomFieldsTableHeatmapSwitch} from 'pages/stats/CustomFieldsTableHeatmapSwitch'
import {CustomFieldsTicketCountBreakdownTable} from 'pages/stats/CustomFieldsTicketCountBreakdownTable'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {TicketInsightsValueModeSwitch} from 'pages/stats/TicketInsightsValueModeSwitch'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

const REPORT_TITLE = 'All used values'
const REPORT_HINT =
    'Number of tickets labeled with each value within the selected timeframe for the selected Ticket Field. Only values that have been used at least once are shown.'

export const CustomFieldsTicketCountBreakdownReport = () => {
    const {id} = useAppSelector(getSelectedCustomField)

    return (
        <ChartCard
            title={REPORT_TITLE}
            hint={REPORT_HINT}
            noPadding={true}
            titleExtra={
                <div className={css.switches}>
                    <TicketInsightsValueModeSwitch />
                    <CustomFieldsTableHeatmapSwitch />
                </div>
            }
        >
            {id !== null ? (
                <CustomFieldsTicketCountBreakdownTable
                    selectedCustomFieldId={id}
                />
            ) : (
                <NoDataAvailable className={css.NoDataAvailable} />
            )}
        </ChartCard>
    )
}
