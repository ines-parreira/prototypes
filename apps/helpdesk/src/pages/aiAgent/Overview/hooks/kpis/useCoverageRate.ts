import { useMemo } from 'react'

import { getAiAgentCoverageRate } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { customFieldsTicketTotalCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useAllTickets } from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'
import type { KpiMetric } from 'pages/aiAgent/Overview/types'
import { AUTOMATION_RATE_TOOLTIP } from 'pages/automate/automate-metrics/AutomationRateMetric'

export const useCoverageRate = (
    filters: StatsFilters,
    timezone: string,
    integrationIds?: string[],
): KpiMetric => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const allTickets = useAllTickets(filters, timezone)

    const aiAgentTickets = useMultipleMetricsTrends(
        customFieldsTicketTotalCountQueryFactory({
            filters,
            timezone,
            customFieldId: outcomeCustomFieldId,
            additionalFilters:
                integrationIds && integrationIds.length > 0
                    ? [
                          {
                              member: TicketMessagesMember.IntegrationChannelPair,
                              operator: ReportingFilterOperator.Equals,
                              values: integrationIds,
                          },
                      ]
                    : undefined,
        }),
        customFieldsTicketTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            customFieldId: outcomeCustomFieldId,
            additionalFilters:
                integrationIds && integrationIds.length > 0
                    ? [
                          {
                              member: TicketMessagesMember.IntegrationChannelPair,
                              operator: ReportingFilterOperator.Equals,
                              values: integrationIds,
                          },
                      ]
                    : undefined,
        }),
    )

    const {
        isFetching: aiAgentCoverageRateIsFetching,
        data: aiAgentCoverageRateData,
    } = getAiAgentCoverageRate({
        isFetching: allTickets.isFetching || aiAgentTickets.isFetching,
        isError: allTickets.isError || aiAgentTickets.isError,
        aiAgentTickets:
            aiAgentTickets.data?.[
                TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
            ],
        allTickets: allTickets.data?.[TicketMeasure.TicketCount],
    })

    const { isFetching: automationRateIsFetching, data: automationRateData } =
        useAutomationRateTrend(filters, timezone)
    const {
        isLoading: aiAgentAutomationRateIsLoading,
        value: aiAgentAutomationRateValue,
    } = useAiAgentAutomationRate(filters, timezone)

    const coverageRate = useMemo<
        Pick<KpiMetric, 'hint' | 'isLoading' | 'prevValue' | 'value'>
    >(() => {
        if (
            automationRateIsFetching ||
            aiAgentAutomationRateIsLoading ||
            aiAgentCoverageRateIsFetching
        ) {
            return {
                isLoading: true,
                value: null,
                prevValue: null,
            }
        }

        if (
            (aiAgentAutomationRateValue ?? 0).toFixed(4) ===
                automationRateData.value.toFixed(4) &&
            automationRateData.value !== 0
        ) {
            return {
                title: 'Coverage Rate',
                isLoading: false,
                hint: {
                    title: 'Percentage of tickets that AI Agent attempted to respond to.',
                },
                ...aiAgentCoverageRateData,
            }
        }
        return {
            title: 'Automation Rate',
            isLoading: false,
            hint: AUTOMATION_RATE_TOOLTIP,
            ...automationRateData,
        }
    }, [
        automationRateIsFetching,
        aiAgentAutomationRateIsLoading,
        aiAgentCoverageRateIsFetching,
        aiAgentAutomationRateValue,
        automationRateData,
        aiAgentCoverageRateData,
    ])

    return {
        metricFormat: 'decimal-to-percent-precision-1',
        'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
        ...coverageRate,
    }
}
