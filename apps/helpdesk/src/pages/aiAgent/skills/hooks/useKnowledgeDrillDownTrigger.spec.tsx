import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'

import { useKnowledgeDrillDownTrigger } from './useKnowledgeDrillDownTrigger'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentTicketDrilldownClicked: 'ai_agent_ticket_drilldown_clicked',
    },
}))

jest.mock('hooks/useAppDispatch')

jest.mock('domains/reporting/state/ui/stats/drillDownSlice', () => ({
    setMetricData: jest.fn((data) => ({
        type: 'setMetricData',
        payload: data,
    })),
}))

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownTableConfig',
    () => ({
        DomainsConfig: {
            knowledge: {
                modalTriggerTooltipText: 'View tickets',
            },
        },
        MetricsConfig: {
            [KnowledgeMetric.Tickets]: {
                domain: 'knowledge',
            },
            [KnowledgeMetric.HandoverTickets]: {
                domain: 'knowledge',
            },
            [KnowledgeMetric.CSAT]: {
                domain: 'knowledge',
            },
        },
    }),
)

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockLogEvent = logEvent as jest.Mock
const mockSetMetricData = setMetricData as unknown as jest.Mock

describe('useKnowledgeDrillDownTrigger', () => {
    const mockDispatch = jest.fn()

    const defaultParams = {
        metricName: KnowledgeMetric.Tickets,
        resourceSourceId: 123,
        resourceSourceSetId: 456,
        shopIntegrationId: 789,
        dateRange: {
            start_datetime: '2023-01-01',
            end_datetime: '2023-01-31',
        },
        outcomeCustomFieldId: 111,
        intentCustomFieldId: 222,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    it('should return openDrillDownModal function and tooltipText', () => {
        const { result } = renderHook(() =>
            useKnowledgeDrillDownTrigger(defaultParams),
        )

        expect(result.current.openDrillDownModal).toBeInstanceOf(Function)
        expect(result.current.tooltipText).toBe('View tickets')
    })

    it('should use custom title when provided', () => {
        const { result } = renderHook(() =>
            useKnowledgeDrillDownTrigger({
                ...defaultParams,
                title: 'Custom Title',
            }),
        )

        expect(result.current.tooltipText).toBe('Custom Title')
    })

    it('should dispatch setMetricData with correct data when openDrillDownModal is called', () => {
        const { result } = renderHook(() =>
            useKnowledgeDrillDownTrigger(defaultParams),
        )

        result.current.openDrillDownModal()

        expect(mockSetMetricData).toHaveBeenCalledWith({
            title: 'View tickets',
            metricName: KnowledgeMetric.Tickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange: {
                start_datetime: '2023-01-01',
                end_datetime: '2023-01-31',
            },
            outcomeCustomFieldId: 111,
            intentCustomFieldId: 222,
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'setMetricData',
            payload: expect.any(Object),
        })
    })

    it('should log Segment event when openDrillDownModal is called', () => {
        const { result } = renderHook(() =>
            useKnowledgeDrillDownTrigger(defaultParams),
        )

        result.current.openDrillDownModal()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTicketDrilldownClicked,
            { metric: KnowledgeMetric.Tickets },
        )
    })

    it('should memoize callback when params unchanged', () => {
        const { result, rerender } = renderHook(
            (props) => useKnowledgeDrillDownTrigger(props),
            {
                initialProps: defaultParams,
            },
        )

        const firstCallback = result.current.openDrillDownModal

        rerender(defaultParams)

        const secondCallback = result.current.openDrillDownModal

        expect(firstCallback).toBe(secondCallback)
    })
})
