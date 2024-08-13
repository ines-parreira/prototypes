import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import userEvent from '@testing-library/user-event'
import {logEvent, SegmentEvent} from 'common/segment'

import {RootState, StoreDispatch} from 'state/types'
import {
    DrillDownMetric,
    setMetricData,
    setShouldUseNewFilterData,
} from 'state/ui/stats/drillDownSlice'
import {
    OverviewMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModalTrigger />', () => {
    const trigger = 'drill down trigger'
    const defaultState = {
        ui: {
            drillDown: {
                metricData: {},
            },
        },
    } as unknown as RootState

    it('should set metric data on trigger and log Segment Event', async () => {
        const store = mockStore(defaultState)
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }

        render(
            <Provider store={store}>
                <DrillDownModalTrigger metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>
            </Provider>
        )

        fireEvent.click(screen.getByText(trigger))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatClicked,
                {metric: metricData.metricName}
            )
        })
    })

    it('should set metric data on trigger and set new filters data in store', async () => {
        const store = mockStore(defaultState)
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }

        render(
            <Provider store={store}>
                <DrillDownModalTrigger
                    metricData={metricData}
                    useNewFilterData={true}
                >
                    {trigger}
                </DrillDownModalTrigger>
            </Provider>
        )

        fireEvent.click(screen.getByText(trigger))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
            expect(store.getActions()).toContainEqual(
                setShouldUseNewFilterData(true)
            )
        })
    })

    it('should not trigger drill down with enabled prop', () => {
        const store = mockStore(defaultState)
        const metricData = {
            metricName: 'someMetric',
        } as any

        render(
            <Provider store={store}>
                <DrillDownModalTrigger enabled={false} metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>
            </Provider>
        )

        fireEvent.click(screen.getByText(trigger))

        expect(store.getActions()).toEqual([])
    })

    it.each([
        VoiceMetric.AverageTalkTime,
        VoiceMetric.AverageWaitTime,
        VoiceAgentsMetric.AgentTotalCalls,
        VoiceAgentsMetric.AgentInboundAnsweredCalls,
        VoiceAgentsMetric.AgentInboundMissedCalls,
        VoiceAgentsMetric.AgentOutboundCalls,
        VoiceAgentsMetric.AgentAverageTalkTime,
    ])(
        'should render tooltip text based on metric name for $metricName',
        async (metricName: string) => {
            const store = mockStore(defaultState)
            const metricData = {
                metricName,
            } as any

            render(
                <Provider store={store}>
                    <DrillDownModalTrigger metricData={metricData}>
                        {trigger}
                    </DrillDownModalTrigger>
                </Provider>
            )

            userEvent.hover(screen.getByText(trigger))

            await waitFor(() => {
                expect(
                    screen.getByText('Click to view calls')
                ).toBeInTheDocument()
            })
        }
    )
})
