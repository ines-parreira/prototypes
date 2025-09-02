import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { DrillDownInfoBar } from 'domains/reporting/pages/common/drill-down/DrillDownInfoBar'
import {
    DrillDownModal,
    getDrillDownConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { DrillDownTable } from 'domains/reporting/pages/common/drill-down/DrillDownTable'
import { MetricsConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownMetricColumn } from 'domains/reporting/pages/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import { CampaignSalesDrillDownTableContent } from 'domains/reporting/pages/convert/components/CampaignSalesDrillDownTableContent'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import VoiceCallDrillDownTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import {
    closeDrillDownModal,
    DrillDownMetric,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/pages/common/drill-down/DrillDownTable')
const DrillDownTableMock = assumeMock(DrillDownTable)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownInfoBar')
const DrillDownInfobarMock = assumeMock(DrillDownInfoBar)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModal />', () => {
    const title = 'drill down'
    const defaultMetricData: DrillDownMetric = {
        title,
        metricName: OverviewMetric.MessagesReceived,
    }
    const defaultState = {
        ui: {
            stats: {
                drillDown: {
                    isOpen: true,
                    metricData: defaultMetricData,
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
        [AIJourneyMetric.TotalOrders, TicketDrillDownTableContent],
        [AIJourneyMetric.ResponseRate, TicketDrillDownTableContent],
    ])(
        'should render correct drill down table content for metric %s',
        (metric, ExpectedTableContentComponent) => {
            const metricData = {
                title: 'Metric title',
                metricName: metric,
            } as DrillDownMetric
            const state = {
                ui: {
                    stats: {
                        drillDown: {
                            isOpen: true,
                            metricData: metricData,
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
                    columnConfig: getDrillDownMetricColumn(
                        metricData,
                        MetricsConfig[metricData.metricName].showMetric,
                    ),
                }),
                {},
            )
            expect(DrillDownInfobarMock).toHaveBeenCalledWith(
                {
                    metricData: state.ui.stats.drillDown.metricData,
                    useDataHook: expect.any(Function),
                    domainConfig: getDrillDownConfig(metricData),
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
