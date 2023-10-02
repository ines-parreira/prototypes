import React from 'react'
import css from 'pages/stats/BreakdownTable.less'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import {CustomFieldsTicketCountBreakdownTable} from 'pages/stats/CustomFieldsTicketCountBreakdownTable'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

const REPORT_TITLE = 'All used values'
const REPORT_HINT =
    'Number of tickets labeled with each value within the selected timeframe for the selected Ticket Field. Only values that have been used at least once are shown.'

export const CustomFieldsTicketCountBreakdownReport = () => {
    const {id, label} = useAppSelector(getSelectedCustomField)

    return (
        <ChartCard
            title={`${REPORT_TITLE}: ${label}`}
            hint={REPORT_HINT}
            noPadding={true}
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
