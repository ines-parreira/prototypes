import { renderHook } from '@repo/testing'

import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { AiAgentDrillDownConfig } from 'domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { LegacyTicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/LegacyTicketDrillDownTableContent'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

jest.mock('domains/reporting/hooks/useDrillDownData', () => ({
    defaultEnrichmentFields: ['ticket_id'],
    useEnrichedDrillDownData: jest.fn(),
}))

jest.mock(
    'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories',
    () => ({
        allAgentsAutomatedInteractionsDrillDownQueryFactory: jest.fn(),
        shoppingAssistantAutomatedInteractionsDrillDownQueryFactory: jest.fn(),
        supportAgentAutomatedInteractionsDrillDownQueryFactory: jest.fn(),
        allAgentsHandoverInteractionsDrillDownQueryFactory: jest.fn(),
        shoppingAssistantHandoverInteractionsDrillDownQueryFactory: jest.fn(),
        supportAgentHandoverInteractionsDrillDownQueryFactory: jest.fn(),
        allAgentsClosedTicketsDrillDownQueryFactory: jest.fn(),
    }),
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownFormatters',
    () => ({
        formatTicketDrillDownRowData: jest.fn(),
    }),
)

jest.mock('domains/reporting/pages/common/drill-down/helpers')
const mockGetDrillDownQuery = jest.mocked(getDrillDownQuery)

describe('AiAgentDrillDownConfig', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should export correct static config values', () => {
        expect(AiAgentDrillDownConfig.infoBarObjectType).toBe('tickets')
        expect(AiAgentDrillDownConfig.isMetricDataDownloadable).toBe(false)
        expect(AiAgentDrillDownConfig.modalTriggerTooltipText).toBe(
            'Click to view tickets',
        )
        expect(AiAgentDrillDownConfig.tableComponent).toBe(
            TicketDrillDownTableContent,
        )
        expect(AiAgentDrillDownConfig.legacyTableComponent).toBe(
            LegacyTicketDrillDownTableContent,
        )
    })

    it.each(Object.values(AiAgentDrillDownMetricName))(
        'should include %s in metricsConfig',
        (metricName) => {
            expect(AiAgentDrillDownConfig.metricsConfig[metricName]).toEqual({
                showMetric: false,
                domain: Domain.AiAgent,
            })
        },
    )

    it('should call getDrillDownQuery with metricData and pass result to useEnrichedDrillDownData', () => {
        const mockQueryFactory = jest.fn()
        mockGetDrillDownQuery.mockReturnValue(mockQueryFactory)

        const metricData = {
            metricName: AiAgentDrillDownMetricName.AutomatedInteractionsCard,
            title: 'Automated interactions',
        } as DrillDownMetric

        renderHook(() => AiAgentDrillDownConfig.drillDownHook(metricData))

        expect(getDrillDownQuery).toHaveBeenCalledWith(metricData)
        expect(useEnrichedDrillDownData).toHaveBeenCalledWith(
            mockQueryFactory,
            metricData,
            defaultEnrichmentFields,
            formatTicketDrillDownRowData,
            EnrichmentFields.TicketId,
        )
    })
})
