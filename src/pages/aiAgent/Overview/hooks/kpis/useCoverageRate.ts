import { useMemo } from 'react'

import { getAiAgentCoverageRate } from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import { useAutomationRateTrend } from 'hooks/reporting/automate/useAutomationRateTrend'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { TicketCustomFieldsMeasure } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { customFieldsTicketTotalCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { StatsFilters } from 'models/stat/types'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useAllTickets } from 'pages/aiAgent/Overview/hooks/kpis/useAllTickets'
import { useCustomFieldOutcome } from 'pages/aiAgent/Overview/hooks/useCustomFieldOutcome'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import { AUTOMATION_RATE_TOOLTIP } from 'pages/automate/automate-metrics/AutomationRateMetric'
import { getPreviousPeriod } from 'utils/reporting'

export const useCoverageRate = (
    filters: StatsFilters,
    timezone: string,
): KpiMetric => {
    const customField = useCustomFieldOutcome()

    const allTickets = useAllTickets(filters, timezone)

    const aiAgentTickets = useMultipleMetricsTrends(
        customFieldsTicketTotalCountQueryFactory({
            filters,
            timezone,
            customFieldId: customField,
        }),
        customFieldsTicketTotalCountQueryFactory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
            customFieldId: customField,
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
            automationRateData.value.toFixed(4)
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
        metricFormat: 'decimal-to-percent',
        'data-candu-id': 'ai-agent-overview-kpi-coverage-rate',
        ...coverageRate,
    }
}
