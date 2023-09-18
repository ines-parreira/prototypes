import React from 'react'
import DashboardSection from 'pages/stats/DashboardSection'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'

import StatsPage from './StatsPage'
import {SupportPerformanceFilters} from './SupportPerformanceFilters'

export const TICKET_INSIGHTS_PAGE_TITLE = 'Ticket insights'

export default function SupportPerformanceTicketInsights() {
    return (
        <StatsPage
            title={TICKET_INSIGHTS_PAGE_TITLE}
            filters={
                <>
                    <SupportPerformanceFilters />
                </>
            }
        >
            <DashboardSection>
                <CustomFieldSelect />
            </DashboardSection>
        </StatsPage>
    )
}
