import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, renderHook, userEvent } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import {
    DrillDownModalTrigger,
    useOpenDrillDownModal,
} from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('<DrillDownModalTrigger />', () => {
    const trigger = 'drill down trigger'

    it('should set metric data on trigger and log Segment Event', async () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }

        const { store } = render(
            <DrillDownModalTrigger metricData={metricData}>
                {trigger}
            </DrillDownModalTrigger>,
            { storeState: {} },
        )

        fireEvent.click(screen.getByText(trigger))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatClicked,
                { metric: metricData.metricName },
            )
        })
    })

    it('should set metric data on trigger and set new filters data in store', async () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }

        const { store } = render(
            <DrillDownModalTrigger metricData={metricData}>
                {trigger}
            </DrillDownModalTrigger>,
            { storeState: {} },
        )

        fireEvent.click(screen.getByText(trigger))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
        })
    })

    it.each([
        VoiceMetric.AverageTalkTime,
        VoiceMetric.AverageWaitTime,
        VoiceMetric.QueueAverageWaitTime,
        VoiceMetric.QueueAverageTalkTime,
        VoiceMetric.QueueInboundCalls,
        VoiceMetric.QueueInboundUnansweredCalls,
        VoiceMetric.QueueInboundMissedCalls,
        VoiceMetric.QueueInboundAbandonedCalls,
        VoiceMetric.QueueOutboundCalls,
        VoiceAgentsMetric.AgentTotalCalls,
        VoiceAgentsMetric.AgentInboundAnsweredCalls,
        VoiceAgentsMetric.AgentInboundMissedCalls,
        VoiceAgentsMetric.AgentOutboundCalls,
        VoiceAgentsMetric.AgentAverageTalkTime,
    ])(
        'should render tooltip text based on metric name for $metricName',
        async (metricName: string) => {
            const metricData = {
                metricName,
            } as any

            render(
                <DrillDownModalTrigger metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>,
                { storeState: {} },
            )

            await userEvent.hover(screen.getByText(trigger))

            await waitFor(() => {
                expect(
                    screen.getByText('Click to view calls'),
                ).toBeInTheDocument()
            })
        },
    )
})

describe('useOpenDrillDownModal', () => {
    const metricData: DrillDownMetric = {
        metricName: OverviewMetric.OpenTickets,
    }

    it('returns a function', () => {
        const { result } = renderHook(() => useOpenDrillDownModal(metricData))

        expect(typeof result.current).toBe('function')
    })

    it('sets metric data', async () => {
        const { result, store } = renderHook(() =>
            useOpenDrillDownModal(metricData),
        )

        result.current()

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
        })
    })

    it('logs segment event', async () => {
        const { result } = renderHook(() => useOpenDrillDownModal(metricData))

        result.current()

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatClicked,
                { metric: metricData.metricName },
            )
        })
    })
})
