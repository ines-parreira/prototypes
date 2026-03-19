import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UserRole } from 'config/types/user'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { DrillDownInfoBar } from 'domains/reporting/pages/common/drill-down/DrillDownInfoBar'
import { getDrillDownConfig } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    KnowledgeMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { useRunningJobs } from 'jobs'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('jobs')
const useRunningJobsMock = assumeMock(useRunningJobs)

jest.mock('domains/reporting/hooks/useDrillDownData', () => ({
    useDrillDownQueryWithoutLimit: jest.fn(() => ({})),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownInfoBar />', () => {
    const metricData: DrillDownMetric = {
        metricName: OverviewMetric.OpenTickets,
    }
    const totalResults = 50

    const useDrillDownDataMock = jest.fn().mockReturnValue({
        totalResults,
        isFetching: false,
    } as any)

    beforeEach(() => {
        jest.clearAllMocks()
        useRunningJobsMock.mockReturnValue({
            running: false,
        } as any)
    })

    const createDefaultStore = (overrides = {}) => {
        return mockStore({
            currentUser: fromJS({
                id: 1,
                role: { name: UserRole.Admin },
            }),
            ui: {
                stats: {
                    drillDown: {
                        export: {
                            isLoading: false,
                            isError: false,
                            isRequested: false,
                        },
                    },
                },
            },
            ...overrides,
        } as RootState)
    }

    const renderInfoBar = (
        metricData: DrillDownMetric,
        store = createDefaultStore(),
    ) => {
        return render(
            <Provider store={store}>
                <DrillDownInfoBar
                    metricData={metricData}
                    useDataHook={useDrillDownDataMock}
                    domainConfig={getDrillDownConfig(metricData)}
                />
            </Provider>,
        )
    }

    describe('Info display', () => {
        it('should render the infobar with current number of results', () => {
            renderInfoBar(metricData)

            expect(
                screen.getByText(`${totalResults}`, { exact: false }),
            ).toBeInTheDocument()
        })

        it(`should render the Infobar when ${DRILLDOWN_QUERY_LIMIT} results or more`, () => {
            const totalResults = 200
            useDrillDownDataMock.mockReturnValue({
                totalResults,
                isFetching: false,
            } as any)

            renderInfoBar(metricData)

            expect(
                screen.getByText(String(DRILLDOWN_QUERY_LIMIT), {
                    exact: false,
                }),
            ).toBeInTheDocument()
        })

        it('should render fetching placeholder when fetching', () => {
            useDrillDownDataMock.mockReturnValue({
                totalResults,
                isFetching: true,
            } as any)

            renderInfoBar(metricData)

            expect(
                screen.getByText('Fetching tickets...', { exact: false }),
            ).toBeInTheDocument()
        })

        it('should render special label for CSAT knowledge metric', () => {
            const csatMetricData: DrillDownMetric = {
                metricName: KnowledgeMetric.CSAT,
                resourceSourceId: 1,
                resourceSourceSetId: 1,
                shopIntegrationId: 789,
                dateRange: {
                    start_datetime: '2023-01-01T00:00:00.000',
                    end_datetime: '2023-12-31T23:59:59.999',
                },
            }
            useDrillDownDataMock.mockReturnValue({
                totalResults: 150,
                isFetching: false,
            } as any)

            renderInfoBar(csatMetricData)

            expect(
                screen.getByText(
                    `Displaying last ${DRILLDOWN_QUERY_LIMIT} tickets used to compute the metric`,
                ),
            ).toBeInTheDocument()
        })

        it.each(Object.values(AiAgentDrillDownMetricName))(
            'should render special label for AI Agent metric %s',
            (metric) => {
                const aiAgentMetricData: DrillDownMetric = {
                    metricName: metric,
                }
                useDrillDownDataMock.mockReturnValue({
                    totalResults: 150,
                    isFetching: false,
                } as any)

                renderInfoBar(aiAgentMetricData)

                expect(
                    screen.getByText(
                        `Displaying last ${DRILLDOWN_QUERY_LIMIT} tickets used to compute the metric`,
                    ),
                ).toBeInTheDocument()
            },
        )

        it.each([
            [ConvertMetric.CampaignSalesCount, 'orders'],
            [VoiceMetric.AverageWaitTime, 'voice calls'],
            [VoiceMetric.AverageTalkTime, 'voice calls'],
            [VoiceMetric.QueueAverageWaitTime, 'voice calls'],
            [VoiceMetric.QueueAverageTalkTime, 'voice calls'],
            [VoiceMetric.QueueInboundCalls, 'voice calls'],
            [VoiceMetric.QueueOutboundCalls, 'voice calls'],
            [VoiceAgentsMetric.AgentAverageTalkTime, 'voice calls'],
            [VoiceAgentsMetric.AgentInboundAnsweredCalls, 'voice calls'],
            [VoiceAgentsMetric.AgentInboundMissedCalls, 'voice calls'],
            [VoiceAgentsMetric.AgentOutboundCalls, 'voice calls'],
            [VoiceAgentsMetric.AgentTotalCalls, 'voice calls'],
        ])(
            'should render the correct object type for %s',
            (metric, objectType) => {
                const metricData = {
                    metricName: metric,
                } as any
                useDrillDownDataMock.mockReturnValue({
                    totalResults,
                    isFetching: false,
                } as any)

                renderInfoBar(metricData)

                expect(
                    screen.getByText(objectType, { exact: false }),
                ).toBeInTheDocument()
            },
        )

        it.each([
            [OverviewMetric.OpenTickets, '1 ticket'],
            [ConvertMetric.CampaignSalesCount, '1 order'],
            [VoiceMetric.AverageWaitTime, '1 voice call'],
        ])(
            'should render singular form when totalResults is 1 for %s',
            (metric, expectedText) => {
                const metricData = {
                    metricName: metric,
                } as any
                useDrillDownDataMock.mockReturnValue({
                    totalResults: 1,
                    isFetching: false,
                } as any)

                renderInfoBar(metricData)

                expect(screen.getByText(expectedText)).toBeInTheDocument()
            },
        )
    })

    describe('Download button visibility', () => {
        it('should render the download button when metric data is downloadable', () => {
            const metricData: DrillDownMetric = {
                metricName: OverviewMetric.OpenTickets,
            }

            renderInfoBar(metricData)

            expect(screen.getByRole('button')).toBeInTheDocument()
            expect(screen.getByText('Export')).toBeInTheDocument()
        })

        it.each([
            VoiceMetric.AverageTalkTime,
            VoiceMetric.AverageWaitTime,
            VoiceMetric.QueueAverageTalkTime,
            VoiceMetric.QueueAverageWaitTime,
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
            `should not render the download button when metric data is not downloadable`,
            (metric) => {
                const metricData: DrillDownMetric = {
                    metricName: metric,
                } as DrillDownMetric

                renderInfoBar(metricData)

                expect(screen.queryByRole('button')).not.toBeInTheDocument()
            },
        )
    })

    describe('Download button states', () => {
        it('should show "Export" when less than limit results', () => {
            useDrillDownDataMock.mockReturnValue({
                totalResults: 50,
                isFetching: false,
            } as any)

            renderInfoBar(metricData)

            expect(screen.getByText('Export')).toBeInTheDocument()
        })

        it('should show "Export all tickets" when at or above limit', () => {
            useDrillDownDataMock.mockReturnValue({
                totalResults: 150,
                isFetching: false,
            } as any)

            renderInfoBar(metricData)

            expect(screen.getByText('Export all tickets')).toBeInTheDocument()
        })

        it('should show "Loading" when export is loading', () => {
            const store = createDefaultStore({
                ui: {
                    stats: {
                        drillDown: {
                            export: {
                                isLoading: true,
                                isError: false,
                                isRequested: false,
                            },
                        },
                    },
                },
            })

            renderInfoBar(metricData, store)

            expect(screen.getByText('Loading')).toBeInTheDocument()
        })

        it('should show "Download Requested" when export is requested', () => {
            const store = createDefaultStore({
                ui: {
                    stats: {
                        drillDown: {
                            export: {
                                isLoading: false,
                                isError: false,
                                isRequested: true,
                            },
                        },
                    },
                },
            })

            renderInfoBar(metricData, store)

            expect(screen.getByText('Download Requested')).toBeInTheDocument()
        })
    })

    describe('Download button click', () => {
        it('should dispatch action on click', async () => {
            const store = createDefaultStore()
            const dispatchSpy = jest.spyOn(store, 'dispatch')

            renderInfoBar(metricData, store)

            await act(() => userEvent.click(screen.getByRole('button')))

            expect(dispatchSpy).toHaveBeenCalled()
        })

        it('should not trigger download when requested', async () => {
            const store = createDefaultStore({
                ui: {
                    stats: {
                        drillDown: {
                            export: {
                                isLoading: false,
                                isError: false,
                                isRequested: true,
                            },
                        },
                    },
                },
            })
            const dispatchSpy = jest.spyOn(store, 'dispatch')

            renderInfoBar(metricData, store)

            await act(() => userEvent.click(screen.getByRole('button')))

            expect(dispatchSpy).not.toHaveBeenCalled()
        })
    })
})
