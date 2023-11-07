import React from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'

import {CustomFieldsTicketCountBreakdownReport} from 'pages/stats/CustomFieldsTicketCountBreakdownReport'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {TicketInsightsFieldTrend} from 'pages/stats/TicketInsightsFieldTrend'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import {TicketFieldsBlankState} from 'pages/stats/TicketFieldsBlankState'
import {DownloadTicketFieldsDataButton} from 'pages/stats/DownloadTicketFieldsDataButton'
import StatsPage from 'pages/stats/StatsPage'

import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'

export const TICKET_INSIGHTS_PAGE_TITLE = 'Ticket Fields'

export default function SupportPerformanceTicketInsights() {
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    if (!selectedCustomField.isLoading && selectedCustomField.id === null) {
        return (
            <StatsPage title={TICKET_INSIGHTS_PAGE_TITLE} filters={null}>
                <TicketFieldsBlankState />
            </StatsPage>
        )
    }

    return (
        <StatsPage
            title={TICKET_INSIGHTS_PAGE_TITLE}
            filters={
                selectedCustomField.id ? (
                    <>
                        <SupportPerformanceFilters />
                        <DownloadTicketFieldsDataButton
                            selectedCustomFieldId={selectedCustomField.id}
                        />
                    </>
                ) : null
            }
        >
            <DashboardSection className="pb-0">
                <CustomFieldSelect />
            </DashboardSection>

            {selectedCustomField.id && (
                <DashboardSection>
                    <DashboardGridCell size={1}>
                        <TicketDistributionTable />
                    </DashboardGridCell>
                    <DashboardGridCell size={11}>
                        <TicketInsightsFieldTrend />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <CustomFieldsTicketCountBreakdownReport />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            <AnalyticsFooter />
        </StatsPage>
    )
}
