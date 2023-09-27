import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {TicketInsightsFieldTrend} from 'pages/stats/TicketInsightsFieldTrend'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import StatsPage from 'pages/stats/StatsPage'
import {FeatureFlagKey} from 'config/featureFlags'

export const TICKET_INSIGHTS_PAGE_TITLE = 'Ticket Fields'

export default function SupportPerformanceTicketInsights() {
    const hasAnalyticsTicketInsightsTopFields: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsightsTopFields]
    const hasAnalyticsTicketInsightsFieldTrends: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsTicketInsightsFieldTrends]

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
            <DashboardSection>
                {hasAnalyticsTicketInsightsTopFields && (
                    <DashboardGridCell size={5}>
                        <TicketDistributionTable />
                    </DashboardGridCell>
                )}
                {hasAnalyticsTicketInsightsFieldTrends && (
                    <DashboardGridCell size={7}>
                        <TicketInsightsFieldTrend />
                    </DashboardGridCell>
                )}
            </DashboardSection>
        </StatsPage>
    )
}
