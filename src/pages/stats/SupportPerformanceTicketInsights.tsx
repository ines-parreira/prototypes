import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {CustomFieldsTicketCountBreakdownReport} from 'pages/stats/CustomFieldsTicketCountBreakdownReport'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {TicketInsightsFieldTrend} from 'pages/stats/TicketInsightsFieldTrend'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import {TicketFieldsBlankState} from 'pages/stats/TicketFieldsBlankState'
import StatsPage from 'pages/stats/StatsPage'
import {FeatureFlagKey} from 'config/featureFlags'

import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'

export const TICKET_INSIGHTS_PAGE_TITLE = 'Ticket Fields'

export default function SupportPerformanceTicketInsights() {
    const hasAnalyticsTicketInsightsTopFields: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsightsTopFields]
    const hasAnalyticsTicketInsightsFieldTrends: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsightsFieldTrends]
    const hasAnalyticsTicketInsightsFieldBreakdown: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsightsFieldBreakdown]

    const selectedCustomField = useAppSelector(getSelectedCustomField)

    if (
        selectedCustomField.isLoading === false &&
        selectedCustomField.id === null
    ) {
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
                <>
                    <SupportPerformanceFilters />
                </>
            }
        >
            <DashboardSection className="pb-0">
                <CustomFieldSelect />
            </DashboardSection>

            {selectedCustomField.id && (
                <DashboardSection>
                    {hasAnalyticsTicketInsightsTopFields && (
                        <DashboardGridCell size={1}>
                            <TicketDistributionTable />
                        </DashboardGridCell>
                    )}
                    {hasAnalyticsTicketInsightsFieldTrends && (
                        <DashboardGridCell size={11}>
                            <TicketInsightsFieldTrend />
                        </DashboardGridCell>
                    )}
                    {hasAnalyticsTicketInsightsFieldBreakdown && (
                        <DashboardGridCell>
                            <CustomFieldsTicketCountBreakdownReport />
                        </DashboardGridCell>
                    )}
                </DashboardSection>
            )}
        </StatsPage>
    )
}
