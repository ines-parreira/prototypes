import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('useDrillDownModalTrigger', () => {
    const metricName = OverviewMetric.OpenTickets
    const customTitle = 'Custom Tooltip Text'
    const integrationId = 'integration-123'
    const journeyIds = ['journey-1', 'journey-2']

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return openDrillDownModal function and tooltipText', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useDrillDownModalTrigger({ metricName }),
        )

        expect(typeof result.current.openDrillDownModal).toBe('function')
        expect(typeof result.current.tooltipText).toBe('string')
    })

    it('should use custom title when provided', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useDrillDownModalTrigger({ metricName, title: customTitle }),
        )

        expect(result.current.tooltipText).toBe(customTitle)
    })

    it('should use config tooltip text when title not provided', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useDrillDownModalTrigger({ metricName }),
        )

        expect(result.current.tooltipText).toBe('Click to view tickets')
    })

    it('should dispatch setMetricData when openDrillDownModal is called', () => {
        const { result, store } = renderHookWithStoreAndQueryClientProvider(
            () => useDrillDownModalTrigger({ metricName, title: customTitle }),
        )

        result.current.openDrillDownModal()

        expect(store.getActions()).toContainEqual(
            setMetricData({
                title: customTitle,
                metricName,
                integrationId: undefined,
                journeyIds: undefined,
            } as any),
        )
    })

    it('should log segment event with correct parameters when openDrillDownModal is called', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useDrillDownModalTrigger({ metricName }),
        )

        result.current.openDrillDownModal()

        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.StatClicked, {
            metric: metricName,
        })
    })

    it('should use default segment event name', () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useDrillDownModalTrigger({ metricName }),
        )

        result.current.openDrillDownModal()

        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.StatClicked, {
            metric: metricName,
        })
    })

    it('should use custom segment event name when provided', () => {
        const customSegmentEvent = SegmentEvent.AiAgentEnabled
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useDrillDownModalTrigger({
                metricName,
                segmentEventName: customSegmentEvent,
            }),
        )

        result.current.openDrillDownModal()

        expect(logEventMock).toHaveBeenCalledWith(customSegmentEvent, {
            metric: metricName,
        })
    })

    it('should include integrationId in metricData when provided', () => {
        const { result, store } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useDrillDownModalTrigger({
                    metricName,
                    integrationId,
                }),
        )

        result.current.openDrillDownModal()

        expect(store.getActions()).toContainEqual(
            setMetricData({
                title: 'Click to view tickets',
                metricName,
                integrationId,
                journeyIds: undefined,
            } as any),
        )
    })

    it('should include journeyIds in metricData when provided', () => {
        const { result, store } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useDrillDownModalTrigger({
                    metricName,
                    journeyIds,
                }),
        )

        result.current.openDrillDownModal()

        expect(store.getActions()).toContainEqual(
            setMetricData({
                title: 'Click to view tickets',
                metricName,
                integrationId: undefined,
                journeyIds,
            } as any),
        )
    })

    it('should include all optional parameters in metricData when provided', () => {
        const { result, store } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useDrillDownModalTrigger({
                    metricName,
                    title: customTitle,
                    integrationId,
                    journeyIds,
                }),
        )

        result.current.openDrillDownModal()

        expect(store.getActions()).toContainEqual(
            setMetricData({
                title: customTitle,
                metricName,
                integrationId,
                journeyIds,
            } as any),
        )
    })
})
