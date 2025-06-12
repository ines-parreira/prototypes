import { fireEvent, screen, waitFor } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    DrillDownModalTrigger,
    TRIGGER_ID,
    useOpenDrillDownModal,
    WithDrillDownTrigger,
} from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { DrillDownMetric, setMetricData } from 'state/ui/stats/drillDownSlice'
import { VoiceAgentsMetric, VoiceMetric } from 'state/ui/stats/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock, renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('<DrillDownModalTrigger />', () => {
    const trigger = 'drill down trigger'

    it('should set metric data on trigger and log Segment Event', async () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }

        const { store } = renderWithStore(
            <DrillDownModalTrigger metricData={metricData}>
                {trigger}
            </DrillDownModalTrigger>,
            {},
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

        const { store } = renderWithStore(
            <DrillDownModalTrigger metricData={metricData}>
                {trigger}
            </DrillDownModalTrigger>,
            {},
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

            renderWithStore(
                <DrillDownModalTrigger metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>,
                {},
            )

            userEvent.hover(screen.getByText(trigger))

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
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useOpenDrillDownModal(metricData),
        )

        expect(typeof result.current).toBe('function')
    })

    it('sets metric data', async () => {
        const { result, store } = renderHookWithStoreAndQueryClientProvider(
            () => useOpenDrillDownModal(metricData),
        )

        result.current()

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
        })
    })

    it('logs segment event', async () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useOpenDrillDownModal(metricData),
        )

        result.current()

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatClicked,
                { metric: metricData.metricName },
            )
        })
    })
})

describe('WithDrillDownTrigger', () => {
    it('should render Drilldown if metricData provided', async () => {
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }
        const content = 'someContent'
        renderWithStore(
            <WithDrillDownTrigger metricData={metricData}>
                {content}
            </WithDrillDownTrigger>,
            {},
        )

        userEvent.hover(screen.getByText(content))

        await waitFor(() => {
            expect(
                screen.getByText('Click to view', { exact: false }),
            ).toBeInTheDocument()
        })
        const drillDownTrigger = document.querySelector(`[id^="${TRIGGER_ID}"]`)
        expect(drillDownTrigger).toBeInTheDocument()
    })

    it('should render passed value without DrillDown if no metricData provided', async () => {
        const metricData = null
        const content = 'someContent'
        renderWithStore(
            <WithDrillDownTrigger metricData={metricData}>
                {content}
            </WithDrillDownTrigger>,
            {},
        )

        userEvent.hover(screen.getByText(content))

        await waitFor(() => {
            expect(
                screen.queryByText('Click to view', { exact: false }),
            ).not.toBeInTheDocument()
        })
    })
})
