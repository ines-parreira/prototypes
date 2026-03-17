import { renderHook } from '@repo/testing'

import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { successRateV2DrillDownQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { AiAgentDrillDownConfig } from 'domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

jest.mock('domains/reporting/hooks/useDrillDownData', () => ({
    defaultEnrichmentFields: ['ticket_id'],
    useEnrichedDrillDownData: jest.fn(),
}))
jest.mock(
    'domains/reporting/models/queryFactories/ai-sales-agent/metrics',
    () => ({
        successRateV2DrillDownQueryFactory: jest.fn(),
    }),
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownFormatters',
    () => ({
        formatTicketDrillDownRowData: jest.fn(),
    }),
)

describe('AiAgentDrillDownConfig', () => {
    it('should call useEnrichedDrillDownData with the correct arguments when drillDownHook is invoked', () => {
        const metricData = {
            metricName:
                AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
            title: 'Success rate',
        } as DrillDownMetric

        renderHook(() => AiAgentDrillDownConfig.drillDownHook(metricData))

        expect(useEnrichedDrillDownData).toHaveBeenCalledWith(
            successRateV2DrillDownQueryFactory,
            metricData,
            defaultEnrichmentFields,
            formatTicketDrillDownRowData,
            EnrichmentFields.TicketId,
        )
    })
})
