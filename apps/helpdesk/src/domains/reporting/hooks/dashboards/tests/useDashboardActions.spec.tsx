import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { sortBy } from 'lodash'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockAnalyticsCustomReport,
    mockCreateAnalyticsCustomReportHandler,
    mockDeleteAnalyticsCustomReportHandler,
    mockListAnalyticsCustomReportsHandler,
    mockUpdateAnalyticsCustomReportHandler,
} from '@gorgias/helpdesk-mocks'
import type {
    AnalyticsCustomReport,
    AnalyticsCustomReportType,
    ListAnalyticsCustomReports200,
} from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import {
    DASHBOARD_DELETED_ERROR_MESSAGE,
    DASHBOARD_DELETED_SUCCESS_MESSAGE,
    SUCCESSFULLY_CREATED,
    useDashboardActions,
} from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { MAX_DASHBOARDS_ALLOWED } from 'domains/reporting/pages/dashboards/constants'
import * as constants from 'domains/reporting/pages/dashboards/constants'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { dashboardFromApi } from 'domains/reporting/pages/dashboards/utils'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const server = setupServer()
const queryClient = mockQueryClient()

const mockedDispatch = jest.fn()
const onCloseMock = jest.fn()

jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

const dashboard: AnalyticsCustomReport = {
    id: 1,
    name: 'Test Report',
    emoji: '🐱',
    type: 'CUSTOM' as AnalyticsCustomReportType,
    analytics_filter_id: null,
    account_id: 1,
    created_by: 1,
    updated_by: 1,
    created_datetime: '2023-01-01T00:00:00Z',
    updated_datetime: '2023-01-01T00:00:00Z',
    deleted_datetime: null,
    children: [],
}

const createMock = mockCreateAnalyticsCustomReportHandler()
const updateMock = mockUpdateAnalyticsCustomReportHandler()
const deleteMock = mockDeleteAnalyticsCustomReportHandler()
const listMock = mockListAnalyticsCustomReportsHandler()

const localHandlers = [
    createMock.handler,
    updateMock.handler,
    deleteMock.handler,
    listMock.handler,
]

beforeAll(() => server.listen())
beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})
afterAll(() => server.close())

const renderDashboardHook = () => {
    return renderHook(() => useDashboardActions(), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })
}

describe('useDashboardActions', () => {
    const invalidateQueriesMock = jest.spyOn(queryClient, 'invalidateQueries')

    describe('deleteReportHandler', () => {
        const deleteHandlerData = {
            id: dashboard.id,
            name: dashboard.name,
        }

        it('should delete report and show success notification', async () => {
            const { result } = renderDashboardHook()
            result.current.deleteReportHandler(deleteHandlerData)

            await waitFor(() => {
                expect(invalidateQueriesMock).toHaveBeenCalledWith({
                    queryKey:
                        queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                })

                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: `${dashboard.name} ${DASHBOARD_DELETED_SUCCESS_MESSAGE}`,
                })
            })
        })

        it('should show error notification when deletion fails', async () => {
            const { handler } = mockDeleteAnalyticsCustomReportHandler(
                async () => {
                    const error = {
                        error: {
                            msg: 'server error',
                        },
                    } as unknown as null
                    return HttpResponse.json(error, { status: 500 })
                },
            )
            server.use(handler)

            const { result } = renderDashboardHook()
            result.current.deleteReportHandler(deleteHandlerData)

            expect(invalidateQueriesMock).not.toHaveBeenCalled()

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: `${dashboard.name} ${DASHBOARD_DELETED_ERROR_MESSAGE}`,
                })
            })
        })
    })

    describe('updateDashboardHandler', () => {
        const updateHandlerData = {
            chartIds: ['456'],
            onClose: onCloseMock,
            dashboard: {
                id: 1,
                name: 'Test Report',
                analytics_filter_id: null,
                children: [
                    {
                        config_id: '',
                        type: DashboardChildType.Chart,
                    },
                ],
                emoji: '',
            } as DashboardSchema,
        }

        it('should call updateDashboard mutation', async () => {
            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 1 })
                },
            )
            const waitForRequest = updateMock.waitForRequest(server)
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.updateDashboardHandler(updateHandlerData)

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                expect(requestBody).toEqual({
                    name: 'Test Report',
                    emoji: '',
                    analytics_filter_id: null,
                    type: 'custom',
                    children: [
                        {
                            type: 'row',
                            metadata: {},
                            children: [
                                {
                                    type: 'chart',
                                    config_id: '456',
                                    metadata: {},
                                },
                            ],
                        },
                    ],
                })
            })

            await waitFor(() => {
                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.getAnalyticsCustomReport(
                        dashboard.id,
                    ),
                )

                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                )

                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: `Successfully saved 1 chart to ${dashboard.name}`,
                })
            })
        })

        it('should show a different message when saving multiple charts', async () => {
            const { result } = renderDashboardHook()
            result.current.updateDashboardHandler({
                ...updateHandlerData,
                chartIds: ['1', '2'],
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: `Successfully saved 2 charts to ${dashboard.name}`,
                })
            })
        })

        it('should show error notification when saving fails', async () => {
            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async () => {
                    const error = {
                        error: {
                            msg: 'server error',
                        },
                    } as unknown as AnalyticsCustomReport
                    return HttpResponse.json(error, { status: 500 })
                },
            )
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.updateDashboardHandler(updateHandlerData)

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: 'server error',
                })
            })
        })

        it('should show custom error message when saving fails', async () => {
            const customError = 'this is a custom error message.'
            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async () => {
                    const error = {
                        error: {
                            msg: 'server error',
                        },
                    } as unknown as AnalyticsCustomReport
                    return HttpResponse.json(error, { status: 500 })
                },
            )
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.updateDashboardHandler({
                ...updateHandlerData,
                errorMessage: customError,
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: customError,
                })
            })
        })

        it('should preserve layout metadata when chartIds is not provided', async () => {
            const dashboardWithMetadata: DashboardSchema = {
                id: 844,
                name: 'Test Dashboard',
                analytics_filter_id: null,
                emoji: null,
                children: [
                    {
                        type: DashboardChildType.Row,
                        children: [
                            {
                                type: DashboardChildType.Chart,
                                config_id: 'chart-1',
                                metadata: {
                                    layout: { x: 0, y: 0, w: 2, h: 9 },
                                },
                            },
                        ],
                    },
                ],
            }

            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 844 })
                },
            )
            const waitForRequest = updateMock.waitForRequest(server)
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.updateDashboardHandler({
                dashboard: dashboardWithMetadata,
                // No chartIds provided - should preserve metadata
            })

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                const chart = requestBody.children[0].children[0]
                expect(chart.metadata.layout).toEqual({
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 9,
                })
            })
        })

        it('should restructure children when chartIds is provided', async () => {
            const dashboard: DashboardSchema = {
                id: 844,
                name: 'Test Dashboard',
                analytics_filter_id: null,
                emoji: null,
                children: [],
            }

            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 844 })
                },
            )
            const waitForRequest = updateMock.waitForRequest(server)
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.updateDashboardHandler({
                dashboard,
                chartIds: ['chart-1', 'chart-2'],
            })

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                expect(requestBody.children).toEqual([
                    {
                        type: 'row',
                        metadata: {},
                        children: [
                            {
                                type: 'chart',
                                config_id: 'chart-1',
                                metadata: {},
                            },
                            {
                                type: 'chart',
                                config_id: 'chart-2',
                                metadata: {},
                            },
                        ],
                    },
                ])
            })
        })
    })

    describe('addChartToDashboardHandler', () => {
        const firstChartId = '456'
        const secondChartId = '789'
        const updateHandlerData = {
            chartId: firstChartId,
            onSuccess: onCloseMock,
            dashboard: {
                id: 1,
                name: 'Test Report',
                analytics_filter_id: null,
                children: [
                    {
                        config_id: secondChartId,
                        type: DashboardChildType.Chart,
                    },
                ],
                emoji: '',
            } as DashboardSchema,
        }

        const expectedPayload = {
            data: {
                analytics_filter_id:
                    updateHandlerData.dashboard.analytics_filter_id,
                children: [
                    {
                        children: [
                            {
                                config_id: firstChartId,
                                metadata: {},
                                type: DashboardChildType.Chart,
                            },
                            {
                                config_id: secondChartId,
                                metadata: {},
                                type: DashboardChildType.Chart,
                            },
                        ],
                        metadata: {},
                        type: DashboardChildType.Row,
                    },
                ],
                emoji: updateHandlerData.dashboard.emoji,
                name: updateHandlerData.dashboard.name,
                type: 'custom',
            },
        }

        it('should call updateDashboard mutation', async () => {
            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 1 })
                },
            )
            const waitForRequest = updateMock.waitForRequest(server)
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.addChartToDashboardHandler(updateHandlerData)

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                expect(requestBody).toEqual(expectedPayload.data)
            })

            await waitFor(() => {
                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.getAnalyticsCustomReport(
                        dashboard.id,
                    ),
                )

                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                )

                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: `Successfully added chart to ${dashboard.name}`,
                })
            })
        })
    })

    describe('removeChartFromDashboardHandler', () => {
        const firstChartId = '456'
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'Test Report',
            emoji: '📊',
            children: [
                {
                    config_id: firstChartId,
                    type: DashboardChildType.Chart,
                },
                {
                    config_id: '678',
                    type: DashboardChildType.Chart,
                },
            ],
            analytics_filter_id: 123,
        }
        const data = {
            chartId: firstChartId,
            dashboard,
        }

        const expectedPayload = {
            analytics_filter_id: dashboard.analytics_filter_id,
            children: [
                {
                    children: [
                        {
                            config_id: '678',
                            metadata: {},
                            type: DashboardChildType.Chart,
                        },
                    ],
                    metadata: {},
                    type: DashboardChildType.Row,
                },
            ],
            emoji: dashboard.emoji,
            name: dashboard.name,
            type: 'custom',
        }

        it('should remove chart from dashboard', async () => {
            const updateMock = mockUpdateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 1 })
                },
            )
            const waitForRequest = updateMock.waitForRequest(server)
            server.use(updateMock.handler)

            const { result } = renderDashboardHook()
            result.current.removeChartFromDashboardHandler(data)

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                expect(requestBody).toEqual(expectedPayload)
            })

            await waitFor(() => {
                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.getAnalyticsCustomReport(
                        dashboard.id,
                    ),
                )

                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                )

                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: 'Successfully removed chart from Test Report',
                })
            })
        })
    })

    describe('getDashboardsHandler', () => {
        it('should return dashboards', async () => {
            const { result } = renderDashboardHook()

            await waitFor(() => {
                expect(result.current.isListing).toBe(false)
            })

            const dashboards = result.current.getDashboardsHandler()

            await waitFor(() => {
                const expectedDashboards = sortBy(
                    listMock.data.data.reduce((acc, dashboard) => {
                        const dash = dashboardFromApi(dashboard)
                        if (dash) {
                            acc.push(dash)
                        }
                        return acc
                    }, [] as DashboardSchema[]),
                    (dashboard) => dashboard.name.toLowerCase(),
                )

                expect(dashboards).toEqual(expectedDashboards)
            })
        })
    })

    describe('createDashboardHandler', () => {
        const chartId = OverviewChart.MedianResolutionTimeTrendCard
        const dashboard = {
            id: 1,
            name: 'Test Report 2',
            analytics_filter_id: null,
            children: [],
            emoji: '',
        }

        const createHandlerData = {
            dashboard: dashboard as DashboardSchema,
            chartIds: [chartId],
        }

        it('should call createDashboard action with correct params', async () => {
            const waitForRequest = createMock.waitForRequest(server)
            server.use(createMock.handler)

            const { result } = renderDashboardHook()

            result.current.createDashboardHandler(createHandlerData)

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                expect(requestBody).toEqual({
                    analytics_filter_id: null,
                    children: [
                        {
                            children: [
                                {
                                    config_id: chartId,
                                    metadata: {},
                                    type: DashboardChildType.Chart,
                                },
                            ],
                            metadata: {},
                            type: DashboardChildType.Row,
                        },
                    ],
                    emoji: '',
                    name: dashboard.name,
                    type: 'custom',
                })
            })

            await waitFor(() => {
                expect(invalidateQueriesMock).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                )

                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: `${dashboard.name} ${SUCCESSFULLY_CREATED}`,
                })
            })
        })

        it('should preserve metadata when creating dashboard with chartIds and existing children', async () => {
            const dashboardWithMetadata: DashboardSchema = {
                id: 1,
                name: 'Test Report with Metadata',
                analytics_filter_id: null,
                emoji: '📊',
                children: [
                    {
                        type: DashboardChildType.Row,
                        children: [
                            {
                                type: DashboardChildType.Chart,
                                config_id: 'chart-1',
                                metadata: {
                                    layout: { x: 0, y: 0, w: 2, h: 9 },
                                },
                            },
                            {
                                type: DashboardChildType.Chart,
                                config_id: 'chart-2',
                                metadata: {
                                    layout: { x: 2, y: 0, w: 2, h: 9 },
                                },
                            },
                        ],
                    },
                ],
            }

            const createMock = mockCreateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 1 })
                },
            )
            const waitForRequest = createMock.waitForRequest(server)
            server.use(createMock.handler)

            const { result } = renderDashboardHook()

            result.current.createDashboardHandler({
                dashboard: dashboardWithMetadata,
                chartIds: ['chart-1', 'chart-2', 'chart-3'],
            })

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                const children = requestBody.children[0].children

                // Verify chart-1 preserved metadata
                expect(children[0]).toEqual({
                    type: 'chart',
                    config_id: 'chart-1',
                    metadata: {
                        layout: { x: 0, y: 0, w: 2, h: 9 },
                    },
                })

                // Verify chart-2 preserved metadata
                expect(children[1]).toEqual({
                    type: 'chart',
                    config_id: 'chart-2',
                    metadata: {
                        layout: { x: 2, y: 0, w: 2, h: 9 },
                    },
                })

                // Verify chart-3 has empty metadata (new chart)
                expect(children[2]).toEqual({
                    type: 'chart',
                    config_id: 'chart-3',
                    metadata: {},
                })
            })
        })

        it('should create dashboard without chartIds using dashboard children', async () => {
            const dashboardWithChildren: DashboardSchema = {
                id: 1,
                name: 'Dashboard with existing structure',
                analytics_filter_id: null,
                emoji: '📊',
                children: [
                    {
                        type: DashboardChildType.Row,
                        children: [
                            {
                                type: DashboardChildType.Chart,
                                config_id: 'existing-chart',
                                metadata: {
                                    layout: { x: 0, y: 0, w: 2, h: 9 },
                                },
                            },
                        ],
                    },
                ],
            }

            const createMock = mockCreateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 1 })
                },
            )
            const waitForRequest = createMock.waitForRequest(server)
            server.use(createMock.handler)

            const { result } = renderDashboardHook()

            result.current.createDashboardHandler({
                dashboard: dashboardWithChildren,
            })

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()

                expect(requestBody.children).toEqual([
                    {
                        type: 'row',
                        metadata: {},
                        children: [
                            {
                                type: 'chart',
                                config_id: 'existing-chart',
                                metadata: {
                                    layout: { x: 0, y: 0, w: 2, h: 9 },
                                },
                            },
                        ],
                    },
                ])
            })
        })

        it('should create dashboard when children property is undefined', async () => {
            const dashboardWithoutChildrenProperty = {
                id: 1,
                name: 'Dashboard without children property',
                analytics_filter_id: null,
                emoji: '📊',
            } as DashboardSchema

            const createMock = mockCreateAnalyticsCustomReportHandler(
                async ({ data }) => {
                    return HttpResponse.json({ ...data, id: 1 })
                },
            )
            const waitForRequest = createMock.waitForRequest(server)
            server.use(createMock.handler)

            const { result } = renderDashboardHook()

            result.current.createDashboardHandler({
                dashboard: dashboardWithoutChildrenProperty,
            })

            await waitForRequest(async (request: Request) => {
                const requestBody = await request.json()
                expect(requestBody.children).toEqual([])
            })
        })

        it('should not call the mutation if dashboards limit is reached', async () => {
            const listMock = mockListAnalyticsCustomReportsHandler(async () => {
                return HttpResponse.json(
                    {
                        data: Array(MAX_DASHBOARDS_ALLOWED + 1).fill(
                            mockAnalyticsCustomReport(),
                        ),
                    } as unknown as ListAnalyticsCustomReports200,
                    { status: 200 },
                )
            })

            server.use(listMock.handler)

            const createHandlerDataWithoutChartIds = {
                dashboard: dashboard as DashboardSchema,
            }

            // useListAnalyticsCustomReportsMock.mockReturnValue({
            //     data: {
            //         data: {
            //             data: Array(MAX_DASHBOARDS_ALLOWED + 1).fill({
            //                 id: 1,
            //                 name: 'B-Test Report',
            //                 analytics_filter_id: undefined,
            //                 children: [
            //                     {
            //                         config_id: '',
            //                         type: DashboardChildType.Chart,
            //                     },
            //                 ],
            //                 emoji: '',
            //             }),
            //         },
            //     },
            // } as any)

            const { result } = renderDashboardHook()

            await waitFor(() => {
                expect(result.current.isListing).toBe(false)
            })

            result.current.createDashboardHandler(
                createHandlerDataWithoutChartIds,
            )

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: constants.LIMIT_REACHED_MESSAGE,
                })
            })
        })

        it('should show error notification when creation fails', async () => {
            const createMock = mockCreateAnalyticsCustomReportHandler(
                async () => {
                    const error = {
                        error: {
                            msg: 'server error',
                        },
                    } as unknown as AnalyticsCustomReport
                    return HttpResponse.json(error, { status: 500 })
                },
            )

            server.use(createMock.handler)

            const { result } = renderDashboardHook()
            result.current.createDashboardHandler(createHandlerData)

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: 'server error',
                })
            })
        })
    })
})
