import { assumeMock } from '@repo/testing'
import { act } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import type { User } from 'config/types/user'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { reportQueryErrorToSentry } from 'domains/reporting/models/resources'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    buildAgentMetric,
    TableLabels,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    closeDrillDownModal,
    createExportDrillDownJob,
    drillDownSlice,
    getDrillDownCurrentPage,
    getDrillDownModalState,
    initialState,
    setCurrentPage,
    setMetricData,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    ConvertMetric,
} from 'domains/reporting/state/ui/stats/types'
import { createJob } from 'models/job/resources'
import type { Job } from 'models/job/types'
import { JobType } from 'models/job/types'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('models/job/resources')
const createJobMock = assumeMock(createJob)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    ui: {
        stats: { [drillDownSlice.name]: initialState },
    },
} as RootState)
jest.mock('domains/reporting/models/resources')
const reportErrorMock = assumeMock(reportQueryErrorToSentry)

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
                }),
            )

            expect(newState.metricData?.metricName).toEqual(
                AgentsTableColumn.CustomerSatisfaction,
            )
            expect(newState.isOpen).toBeTruthy()
        })

        it('should not show closed tickets agents metric', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setMetricData({
                    metricName: AgentsTableColumn.ClosedTickets,
                    perAgentId: 1,
                }),
            )

            expect(newState.metricData?.metricName).toEqual(
                AgentsTableColumn.ClosedTickets,
            )
            expect(newState.isOpen).toEqual(true)
        })

        it('should close the modal', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                closeDrillDownModal(),
            )

            expect(newState.isOpen).toEqual(false)
        })

        it('should set export loading state', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                createExportDrillDownJob.pending,
            )

            expect(newState.export.isLoading).toEqual(true)
        })

        it('should set current page state', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setCurrentPage(5),
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
                    export: { ...initialState.export, isLoading: true },
                },
                action,
            )

            expect(newState.export.isLoading).toEqual(false)
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
                    },
                },
            },
        } as RootState

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
            'someTimeZone',
        )
        const defaultContext = {
            channel_connection_external_ids: [],
        }
        const actionParams = {
            query: exampleQuery,
            jobType: JobType.ExportTicketDrilldown,
            context: defaultContext,
        }
        createJobMock.mockResolvedValue({ id: 123 } as unknown as Job)

        beforeEach(() => {
            store.getState().ui.stats[drillDownSlice.name] = {
                ...store.getState().ui.stats[drillDownSlice.name],
                metricData: {
                    metricName: OverviewMetric.OpenTickets,
                },
            }

            jest.clearAllMocks()
        })

        it('should fire request with export Job', async () => {
            await store.dispatch(createExportDrillDownJob(actionParams))

            expect(createJobMock).toHaveBeenCalledWith({
                type: JobType.ExportTicketDrilldown,
                params: {
                    reporting_query: {
                        ...exampleQuery,
                        metricName: undefined,
                    },
                    metric_name: `${METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS}_drill_down_export`,
                    context: {
                        channel_connection_external_ids: [],
                    },
                },
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
                }),
            )

            expect(createJobMock).toHaveBeenCalledWith({
                type: JobType.ExportConvertCampaignSalesDrilldown,
                params: {
                    reporting_query: { ...exampleQuery, metricName: undefined },
                    context,
                    metric_name: `${METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS}_drill_down_export`,
                },
            })
        })

        it('should invalidate Jobs query cache', async () => {
            const invalidateQueryMock = jest.spyOn(
                mockAppQueryClient,
                'invalidateQueries' as any,
            )

            await act(async () => {
                await store.dispatch(createExportDrillDownJob(actionParams))
            })

            expect(invalidateQueryMock).toHaveBeenCalled()
        })

        it('should report error when request fails', async () => {
            const error = new Error('Request failed')
            createJobMock.mockRejectedValue(error)

            await store.dispatch(createExportDrillDownJob(actionParams))

            expect(reportErrorMock).toHaveBeenCalledWith(error, {
                query: JSON.stringify(exampleQuery),
                metricName: `${METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS}_drill_down_export`,
            })
        })
    })

    it('should build agent metric', () => {
        const agent = {
            id: 1,
            name: 'Test',
        } as User

        expect(
            buildAgentMetric(AgentsTableColumn.CustomerSatisfaction, agent),
        ).toEqual({
            title: `${TableLabels[AgentsTableColumn.CustomerSatisfaction]} | ${
                agent.name
            }`,
            metricName: AgentsTableColumn.CustomerSatisfaction,
            perAgentId: agent.id,
        })
    })
})
