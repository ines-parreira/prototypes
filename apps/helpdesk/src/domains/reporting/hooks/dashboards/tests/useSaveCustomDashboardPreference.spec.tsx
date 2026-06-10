import { renderHook } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockUpdateAnalyticsCustomReportHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'

const server = setupServer()

const updateMock = mockUpdateAnalyticsCustomReportHandler()

const DEBOUNCE_MS = 300

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
    jest.useFakeTimers()
    server.use(updateMock.handler)
})
afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    server.resetHandlers()
})
afterAll(() => server.close())

const DASHBOARD_ID = 42
const CHART_CONFIG_ID = 'flows_table'

const dashboard: DashboardSchema = {
    id: DASHBOARD_ID,
    name: 'My Dashboard',
    emoji: null,
    analytics_filter_id: null,
    children: [
        {
            type: DashboardChildType.Chart,
            config_id: CHART_CONFIG_ID,
        },
    ],
}

const renderSaveHook = (
    params: Parameters<typeof useSaveCustomDashboardPreference>[0],
) => renderHook(() => useSaveCustomDashboardPreference(params))

describe('useSaveCustomDashboardPreference', () => {
    describe('when dashboard is undefined', () => {
        it('does not call the API', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const noRequestTimeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('no request')), 50),
            )

            const { result } = renderSaveHook({
                dashboard: undefined,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({
                    columns: [{ column_id: 'col1', visible: true }],
                })
                jest.advanceTimersByTime(DEBOUNCE_MS + 50)
            })

            await expect(
                Promise.race([waitForRequest(jest.fn()), noRequestTimeout]),
            ).rejects.toThrow('no request')
        })
    })

    describe('when dashboard is provided', () => {
        it('sends column preferences in the PUT request', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const { result } = renderSaveHook({
                dashboard,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({
                    columns: [
                        { column_id: 'col1', visible: true },
                        { column_id: 'col2', visible: true },
                    ],
                })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            await waitForRequest(async (request: Request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    children: [
                        {
                            type: 'chart',
                            config_id: CHART_CONFIG_ID,
                            metadata: {
                                preferences: {
                                    columns: [
                                        { column_id: 'col1', visible: true },
                                        { column_id: 'col2', visible: true },
                                    ],
                                },
                            },
                        },
                    ],
                })
            })
        })

        it('sends measure and dimension preferences in the PUT request', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const { result } = renderSaveHook({
                dashboard,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({
                    measure: 'automationRate',
                    dimension: 'channel',
                })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            await waitForRequest(async (request: Request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    children: [
                        {
                            type: 'chart',
                            config_id: CHART_CONFIG_ID,
                            metadata: {
                                preferences: {
                                    measures: ['automationRate'],
                                    dimensions: ['channel'],
                                },
                            },
                        },
                    ],
                })
            })
        })

        it('merges with existing preferences rather than replacing them', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const dashboardWithExistingPreferences: DashboardSchema = {
                ...dashboard,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: CHART_CONFIG_ID,
                        metadata: {
                            preferences: {
                                measures: ['automationRate'],
                                dimensions: ['channel'],
                            },
                        },
                    },
                ],
            }
            const { result } = renderSaveHook({
                dashboard: dashboardWithExistingPreferences,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({
                    columns: [{ column_id: 'col1', visible: true }],
                })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            await waitForRequest(async (request: Request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    children: [
                        {
                            type: 'chart',
                            config_id: CHART_CONFIG_ID,
                            metadata: {
                                preferences: {
                                    measures: ['automationRate'],
                                    dimensions: ['channel'],
                                    columns: [
                                        { column_id: 'col1', visible: true },
                                    ],
                                },
                            },
                        },
                    ],
                })
            })
        })

        it('coalesces rapid calls into a single PUT with the latest preferences', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const { result } = renderSaveHook({
                dashboard,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({ measure: 'resolutionTime' })
                result.current.savePreferences({
                    measure: 'firstResponseTime',
                })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            await waitForRequest(async (request: Request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    children: [
                        {
                            config_id: CHART_CONFIG_ID,
                            metadata: {
                                preferences: {
                                    measures: ['firstResponseTime'],
                                },
                            },
                        },
                    ],
                })
            })
        })

        it('invalidates the dashboard and list queries after a successful save', async () => {
            const { result } = renderHook(() => ({
                ...useSaveCustomDashboardPreference({
                    dashboard,
                    configId: CHART_CONFIG_ID,
                }),
                queryClient: useQueryClient(),
            }))

            const invalidateQueriesSpy = jest.spyOn(
                result.current.queryClient,
                'invalidateQueries',
            )

            act(() => {
                result.current.savePreferences({ measure: 'automationRate' })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.getAnalyticsCustomReport(
                        updateMock.data.id,
                    ),
                )
                expect(invalidateQueriesSpy).toHaveBeenCalledWith(
                    queryKeys.analyticsCustomReports.listAnalyticsCustomReports(),
                )
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('shows an error toast with the server message when the save fails', async () => {
            const { handler } = mockUpdateAnalyticsCustomReportHandler(
                async () =>
                    HttpResponse.json(
                        { error: { msg: 'server error' } } as unknown as null,
                        { status: 500 },
                    ),
            )
            server.use(handler)

            const { result } = renderSaveHook({
                dashboard,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({ measure: 'automationRate' })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            const toastEl = await screen.findByRole('status', {
                name: 'server error',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('only updates the matching chart when the dashboard has multiple charts', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const OTHER_CHART_ID = 'other_chart'
            const dashboardWithMultipleCharts: DashboardSchema = {
                ...dashboard,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: CHART_CONFIG_ID,
                    },
                    {
                        type: DashboardChildType.Chart,
                        config_id: OTHER_CHART_ID,
                    },
                ],
            }
            const { result } = renderSaveHook({
                dashboard: dashboardWithMultipleCharts,
                configId: CHART_CONFIG_ID,
            })

            act(() => {
                result.current.savePreferences({
                    columns: [{ column_id: 'col1', visible: true }],
                })
                jest.advanceTimersByTime(DEBOUNCE_MS)
            })

            await waitForRequest(async (request: Request) => {
                const body = await request.json()
                const [updatedChart, otherChart] = body.children
                expect(updatedChart.metadata?.preferences?.columns).toEqual([
                    { column_id: 'col1', visible: true },
                ])
                expect(otherChart.metadata?.preferences).toBeUndefined()
            })
        })
    })
})
