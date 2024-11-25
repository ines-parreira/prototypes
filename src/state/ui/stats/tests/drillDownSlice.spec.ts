import {act} from '@testing-library/react'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {appQueryClient} from 'api/queryClient'
import {User} from 'config/types/user'
import {createJob} from 'models/job/resources'
import {Job, JobType} from 'models/job/types'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {SLA_STATUS_COLUMN_LABEL} from 'pages/stats/sla/SlaConfig'
import {
    buildAgentMetric,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    AutoQAAgentsTableColumn,
    AutoQAAgentsColumnConfig,
    TableLabels as autoQATableLabels,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {OverviewMetric} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {MEDIAN_RESOLUTION_TIME_LABEL} from 'services/reporting/constants'
import {RootState, StoreDispatch} from 'state/types'
import {
    initialState,
    setMetricData,
    drillDownSlice,
    getDrillDownMetric,
    getDrillDownMetricColumn,
    getDrillDownModalState,
    createExportDrillDownJob,
    closeDrillDownModal,
    SLA_FORMAT,
    setCurrentPage,
    getDrillDownCurrentPage,
    setShouldUseNewFilterData,
    getIsNewFilter,
} from 'state/ui/stats/drillDownSlice'
import {
    SlaMetric,
    AgentsTableColumn,
    TicketFieldsMetric,
    ConvertMetric,
    VoiceAgentsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('models/job/resources')
const createJobMock = assumeMock(createJob)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    ui: {
        stats: {[drillDownSlice.name]: initialState},
    },
} as RootState)

jest.mock('api/queryClient')
const mockAppQueryClient = assumeMock(appQueryClient as any)

describe('drillDownSlice', () => {
    describe('reducers', () => {
        it('should show the agent customer satisfaction metric', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setMetricData({
                    metricName: AgentsTableColumn.CustomerSatisfaction,
                    perAgentId: 1,
                })
            )

            expect(newState.metricData?.metricName).toEqual(
                AgentsTableColumn.CustomerSatisfaction
            )
            expect(newState.isOpen).toBeTruthy()
        })

        it('should not show closed tickets agents metric', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setMetricData({
                    metricName: AgentsTableColumn.ClosedTickets,
                    perAgentId: 1,
                })
            )

            expect(newState.metricData?.metricName).toEqual(
                AgentsTableColumn.ClosedTickets
            )
            expect(newState.isOpen).toEqual(true)
        })

        it('should close the modal', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                closeDrillDownModal()
            )

            expect(newState.isOpen).toEqual(false)
        })

        it('should set export loading state', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                createExportDrillDownJob.pending
            )

            expect(newState.export.isLoading).toEqual(true)
        })

        it('should set current page state', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setCurrentPage(5)
            )

            expect(newState.currentPage).toEqual(5)
        })

        it.each([
            createExportDrillDownJob.fulfilled,
            createExportDrillDownJob.rejected,
        ])(`should set loading state to false on %s`, (action) => {
            const newState = drillDownSlice.reducer(
                {
                    ...initialState,
                    export: {...initialState.export, isLoading: true},
                },
                action
            )

            expect(newState.export.isLoading).toEqual(false)
        })

        it('should set new filter value to true', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setShouldUseNewFilterData(true)
            )

            expect(newState.isNewFilter).toBeTruthy
        })
    })

    describe('selectors', () => {
        const isOpen = false
        const currentPage = 3
        const metricData = {
            metricName: 'someName',
        }

        const state = {
            ui: {
                stats: {
                    [drillDownSlice.name]: {
                        isOpen,
                        currentPage,
                        metricData,
                        isNewFilter: false,
                    },
                },
            },
        } as RootState

        const voiceAgentsMetricsWithExpectedValues = Object.values(
            VoiceAgentsMetric
        ).map((name) => ({
            metricData: {metricName: name, perAgentId: 123},
            expectedValues: {
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            },
        }))

        it('getDrillDownMetric', () => {
            expect(getDrillDownMetric(state)).toEqual(metricData)
        })

        it('getIsNewFilter', () => {
            expect(getIsNewFilter(state)).toBeFalsy
        })

        it.each([
            {
                metricData: {
                    metricName: AgentsTableColumn.OneTouchTickets,
                    perAgentId: 1,
                },
                expectedValues: {
                    metricTitle: TableLabels[AgentsTableColumn.OneTouchTickets],
                    showMetric: false,
                    metricValueFormat: 'percent',
                },
            },
            {
                metricData: {
                    metricName: AgentsTableColumn.ClosedTickets,
                    perAgentId: 1,
                },
                expectedValues: {
                    metricTitle: TableLabels[AgentsTableColumn.ClosedTickets],
                    showMetric: false,
                    metricValueFormat: 'integer',
                },
            },
            {
                metricData: {
                    metricName: OverviewMetric.MedianResolutionTime,
                },
                expectedValues: {
                    metricTitle: MEDIAN_RESOLUTION_TIME_LABEL,
                    showMetric: true,
                    metricValueFormat: 'duration',
                },
            },
            {
                metricData: null,
                expectedValues: {
                    metricTitle: '',
                    showMetric: false,
                    metricValueFormat: 'decimal',
                },
            },
            {
                metricData: {
                    metricName:
                        TicketFieldsMetric.TicketCustomFieldsTicketCount,
                    customFieldValue: 'customFieldValue',
                },
                expectedValues: {
                    metricTitle: '',
                    showMetric: false,
                    metricValueFormat: 'decimal',
                },
            },
            {
                metricData: {
                    metricName: SlaMetric.AchievementRate,
                },
                expectedValues: {
                    metricTitle: SLA_STATUS_COLUMN_LABEL,
                    showMetric: true,
                    metricValueFormat: SLA_FORMAT,
                },
            },
            {
                metricData: {
                    metricName: ChannelsTableColumns.TicketHandleTime,
                    perChannel: 'some-channel',
                },
                expectedValues: {
                    metricTitle:
                        ChannelsTableLabels[
                            ChannelsTableColumns.TicketHandleTime
                        ],
                    showMetric: true,
                    metricValueFormat:
                        ChannelColumnConfig[
                            ChannelsTableColumns.TicketHandleTime
                        ].format,
                },
            },
            {
                metricData: {
                    metricName: AutoQAAgentsTableColumn.ResolutionCompleteness,
                    perAgentId: 'some-id',
                },
                expectedValues: {
                    metricTitle:
                        autoQATableLabels[
                            AutoQAAgentsTableColumn.ResolutionCompleteness
                        ],
                    showMetric: false,
                    metricValueFormat:
                        AutoQAAgentsColumnConfig[
                            AutoQAAgentsTableColumn.ResolutionCompleteness
                        ].format,
                },
            },
            {
                metricData: {
                    metricName: AutoQAMetric.ResolutionCompleteness,
                },
                expectedValues: {
                    metricTitle:
                        TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                            .title,
                    showMetric: false,
                    metricValueFormat:
                        TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                            .metricFormat,
                },
            },
            {
                metricData: {
                    metricName: AutoQAMetric.ReviewedClosedTickets,
                },
                expectedValues: {
                    metricTitle:
                        TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                            .title,
                    showMetric: false,
                    metricValueFormat:
                        TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                            .metricFormat,
                },
            },
            ...voiceAgentsMetricsWithExpectedValues,
        ])('getDrillDownMetricColumn', ({metricData, expectedValues}) => {
            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        stats: {
                            [drillDownSlice.name]: {
                                metricData,
                            },
                        },
                    },
                } as RootState)
            ).toEqual(expectedValues)
        })

        it('getDrillDownModalState', () => {
            expect(getDrillDownModalState(state)).toEqual(isOpen)
        })

        it('getDrillDownCurrentPage', () => {
            expect(getDrillDownCurrentPage(state)).toEqual(currentPage)
        })
    })

    describe('createExportDrillDownJob', () => {
        const exampleQuery = closedTicketsQueryFactory(
            {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
            },
            'someTimeZone'
        )
        const actionParams = {
            query: exampleQuery,
            jobType: JobType.ExportTicketDrilldown,
        }
        createJobMock.mockResolvedValue({id: 123} as unknown as Job)

        beforeEach(() => {
            store.getState().ui.stats[drillDownSlice.name] = {
                ...store.getState().ui.stats[drillDownSlice.name],
                metricData: {
                    metricName: OverviewMetric.OpenTickets,
                },
            }
        })

        it('should fire request with export Job', async () => {
            await store.dispatch(createExportDrillDownJob(actionParams))

            expect(createJobMock).toHaveBeenCalledWith({
                type: JobType.ExportTicketDrilldown,
                params: {reporting_query: exampleQuery},
            })
        })

        it('should fire request with export Job and context in params', async () => {
            const context = {
                channel_connection_external_ids: ['3', '5'],
            }
            store.getState().ui.stats[drillDownSlice.name] = {
                ...store.getState().ui.stats[drillDownSlice.name],
                metricData: {
                    metricName: ConvertMetric.CampaignSalesCount,
                    campaignsOperator: LogicalOperatorEnum.ONE_OF,
                    shopName: 'candy-shop',
                    selectedCampaignIds: [],
                    context: context,
                },
            }

            await store.dispatch(
                createExportDrillDownJob({
                    ...actionParams,
                    jobType: JobType.ExportConvertCampaignSalesDrilldown,
                    context,
                })
            )

            expect(createJobMock).toHaveBeenCalledWith({
                type: JobType.ExportConvertCampaignSalesDrilldown,
                params: {reporting_query: exampleQuery, context},
            })
        })

        it('should invalidate Jobs query cache', async () => {
            const invalidateQueryMock = jest.spyOn(
                mockAppQueryClient,
                'invalidateQueries' as any
            )

            await act(async () => {
                await store.dispatch(createExportDrillDownJob(actionParams))
            })

            expect(invalidateQueryMock).toHaveBeenCalled()
        })
    })

    it('should build agent metric', () => {
        const agent = {
            id: 1,
            name: 'Test',
        } as User

        expect(
            buildAgentMetric(AgentsTableColumn.CustomerSatisfaction, agent)
        ).toEqual({
            title: `${TableLabels[AgentsTableColumn.CustomerSatisfaction]} | ${
                agent.name
            }`,
            metricName: AgentsTableColumn.CustomerSatisfaction,
            perAgentId: agent.id,
        })
    })
})
