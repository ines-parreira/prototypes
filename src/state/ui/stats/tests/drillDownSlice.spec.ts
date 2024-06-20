import {act} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {SLA_STATUS_COLUMN_LABEL} from 'pages/stats/sla/SlaConfig'
import {appQueryClient} from 'api/queryClient'
import {createJob} from 'models/job/resources'
import {Job, JobType} from 'models/job/types'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {RootState, StoreDispatch} from 'state/types'
import {
    OverviewMetric,
    SlaMetric,
    AgentsTableColumn,
    TicketFieldsMetric,
} from 'state/ui/stats/types'
import {OrderDirection} from 'models/api/types'
import {
    initialState,
    setMetricData,
    drillDownSlice,
    getDrillDownMetric,
    getDrillDownMetricColumn,
    getDrillDownModalState,
    buildAgentMetric,
    createExportTicketDrillDownJob,
    closeDrillDownModal,
    SLA_FORMAT,
} from 'state/ui/stats/drillDownSlice'
import {User} from 'config/types/user'
import {TableLabels} from 'pages/stats/AgentsTableConfig'
import {MEDIAN_RESOLUTION_TIME_LABEL} from 'services/reporting/constants'
import {assumeMock} from 'utils/testing'

jest.mock('models/job/resources')
const createJobMock = assumeMock(createJob)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    ui: {
        [drillDownSlice.name]: initialState,
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
                createExportTicketDrillDownJob.pending
            )

            expect(newState.export.isLoading).toEqual(true)
        })

        it.each([
            createExportTicketDrillDownJob.fulfilled,
            createExportTicketDrillDownJob.rejected,
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
    })

    describe('selectors', () => {
        const isOpen = false
        const metricData = {
            metricName: 'someName',
        }

        const state = {
            ui: {
                [drillDownSlice.name]: {
                    isOpen,
                    metricData,
                },
            },
        } as unknown as RootState

        it('getDrillDownMetric', () => {
            expect(getDrillDownMetric(state)).toEqual({
                metricData,
                metricOrder: OrderDirection.Desc,
            })
            expect(
                getDrillDownMetric({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName:
                                    AgentsTableColumn.CustomerSatisfaction,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricData: {
                    metricName: AgentsTableColumn.CustomerSatisfaction,
                },
                metricOrder: OrderDirection.Asc,
            })
            expect(
                getDrillDownMetric({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: AgentsTableColumn.ClosedTickets,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricData: {
                    metricName: AgentsTableColumn.ClosedTickets,
                },
                metricOrder: OrderDirection.Desc,
            })
        })

        it('getDrillDownMetricColumn', () => {
            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: AgentsTableColumn.OneTouchTickets,
                                perAgentId: 1,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: TableLabels[AgentsTableColumn.OneTouchTickets],
                showMetric: false,
                metricValueFormat: 'percent',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: AgentsTableColumn.ClosedTickets,
                                perAgentId: 1,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: TableLabels[AgentsTableColumn.ClosedTickets],
                showMetric: false,
                metricValueFormat: 'decimal',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: OverviewMetric.MedianResolutionTime,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: MEDIAN_RESOLUTION_TIME_LABEL,
                showMetric: true,
                metricValueFormat: 'duration',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: null,
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName:
                                    TicketFieldsMetric.TicketCustomFieldsTicketCount,
                                customFieldValue: 'customFieldValue',
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: SlaMetric.AchievementRate,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: SLA_STATUS_COLUMN_LABEL,
                showMetric: true,
                metricValueFormat: SLA_FORMAT,
            })
        })

        it('getDrillDownModalState', () => {
            expect(getDrillDownModalState(state)).toEqual(isOpen)
        })
    })

    describe('createExportTicketDrillDownJob', () => {
        const exampleQuery = closedTicketsQueryFactory(
            {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
            },
            'someTimeZone'
        )
        createJobMock.mockResolvedValue({id: 123} as unknown as Job)

        it('should fire request with export Job', async () => {
            await store.dispatch(createExportTicketDrillDownJob(exampleQuery))

            expect(createJobMock).toHaveBeenCalledWith({
                type: JobType.ExportTicketDrilldown,
                params: {reporting_query: exampleQuery},
            })
        })

        it('should invalidate Jobs query cache', async () => {
            const invalidateQueryMock = jest.spyOn(
                mockAppQueryClient,
                'invalidateQueries' as any
            )

            await act(async () => {
                await store.dispatch(
                    createExportTicketDrillDownJob(exampleQuery)
                )
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
