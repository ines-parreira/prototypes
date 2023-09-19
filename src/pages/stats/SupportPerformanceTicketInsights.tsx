import React from 'react'
import DashboardSection from 'pages/stats/DashboardSection'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import StatsPage from 'pages/stats/StatsPage'

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
