import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { DrillDownInfoBar } from 'pages/stats/common/drill-down/DrillDownInfoBar'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import { DrillDownTable } from 'pages/stats/common/drill-down/DrillDownTable'
import { TicketDrillDownTableContent } from 'pages/stats/common/drill-down/TicketDrillDownTableContent'
import { CampaignSalesDrillDownTableContent } from 'pages/stats/convert/components/CampaignSalesDrillDownTableContent'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import VoiceCallDrillDownTableContent from 'pages/stats/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import { RootState, StoreDispatch } from 'state/types'
import {
    closeDrillDownModal,
    DrillDownMetric,
} from 'state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownTable')
const DrillDownTableMock = assumeMock(DrillDownTable)
jest.mock('pages/stats/common/drill-down/DrillDownInfoBar')
const DrillDownInfobarMock = assumeMock(DrillDownInfoBar)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModal />', () => {
    const title = 'drill down'
    const metricData: DrillDownMetric = {
        title,
        metricName: OverviewMetric.MessagesReceived,
    }
    const defaultState = {
        ui: {
            stats: {
                drillDown: {
                    isOpen: true,
                    metricData,
                },
            },
        },
    } as RootState
    const componentMock = () => <div />

    beforeEach(() => {
        DrillDownTableMock.mockImplementation(componentMock)
        DrillDownInfobarMock.mockImplementation(componentMock)
    })

    it('should render the drill down modal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownModal />
            </Provider>,
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it.each([
        [
            TicketFieldsMetric.TicketCustomFieldsTicketCount,
            TicketDrillDownTableContent,
        ],
        [ConvertMetric.CampaignSalesCount, CampaignSalesDrillDownTableContent],
        [VoiceMetric.AverageWaitTime, VoiceCallDrillDownTableContent],
        [VoiceMetric.AverageTalkTime, VoiceCallDrillDownTableContent],
        [VoiceMetric.QueueAverageWaitTime, VoiceCallDrillDownTableContent],
        [VoiceMetric.QueueAverageTalkTime, VoiceCallDrillDownTableContent],
        [VoiceMetric.QueueInboundCalls, VoiceCallDrillDownTableContent],
        [
            VoiceMetric.QueueInboundUnansweredCalls,
            VoiceCallDrillDownTableContent,
        ],
        [VoiceMetric.QueueInboundMissedCalls, VoiceCallDrillDownTableContent],
        [
            VoiceMetric.QueueInboundAbandonedCalls,
            VoiceCallDrillDownTableContent,
        ],
        [VoiceMetric.QueueOutboundCalls, VoiceCallDrillDownTableContent],
        [VoiceAgentsMetric.AgentTotalCalls, VoiceCallDrillDownTableContent],
        [
            VoiceAgentsMetric.AgentInboundAnsweredCalls,
            VoiceCallDrillDownTableContent,
        ],
        [
            VoiceAgentsMetric.AgentInboundMissedCalls,
            VoiceCallDrillDownTableContent,
        ],
        [VoiceAgentsMetric.AgentOutboundCalls, VoiceCallDrillDownTableContent],
        [
            VoiceAgentsMetric.AgentAverageTalkTime,
            VoiceCallDrillDownTableContent,
        ],
        [
            AiSalesAgentChart.AiSalesAgentTotalSalesConv,
            TicketDrillDownTableContent,
        ],
    ])(
        'should render correct drill down table content for metric %s',
        (metric, ExpectedTableContentComponent) => {
            const state = {
                ui: {
                    stats: {
                        drillDown: {
                            isOpen: true,
                            metricData: {
                                title: 'Metric title',
                                metricName: metric,
                            },
                        },
                    },
                },
            } as RootState

            render(
                <Provider store={mockStore(state)}>
                    <DrillDownModal />
                </Provider>,
            )

            expect(DrillDownTableMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricData: state.ui.stats.drillDown.metricData,
                    useDataHook: expect.any(Function),
                    TableContent: ExpectedTableContentComponent,
                }),
                {},
            )
            expect(DrillDownInfobarMock).toHaveBeenCalledWith(
                {
                    metricData: state.ui.stats.drillDown.metricData,
                    useDataHook: expect.any(Function),
                },
                {},
            )
            expect(screen.getByText('Metric title')).toBeInTheDocument()
        },
    )

    it('should close the modal', async () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <DrillDownModal />
            </Provider>,
        )

        fireEvent.click(screen.getByText('close'))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(closeDrillDownModal())
        })
    })
})
