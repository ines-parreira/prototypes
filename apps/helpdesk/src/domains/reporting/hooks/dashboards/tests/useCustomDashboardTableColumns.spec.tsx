import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { mockUpdateAnalyticsCustomReportHandler } from '@gorgias/helpdesk-mocks'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

const DEBOUNCE_MS = 300

const server = setupServer()

const updateMock = mockUpdateAnalyticsCustomReportHandler()

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

const CHART_CONFIG_ID = 'flows_table'

const schema: DashboardChartSchema = {
    type: DashboardChildType.Chart,
    config_id: CHART_CONFIG_ID,
}

const dashboard: DashboardSchema = {
    id: 1,
    name: 'My Dashboard',
    emoji: null,
    analytics_filter_id: null,
    children: [schema],
}

const renderColumnsHook = (
    params: Parameters<typeof useCustomDashboardTableColumns>[0],
) => renderHook(() => useCustomDashboardTableColumns(params))

describe('useCustomDashboardTableColumns', () => {
    describe('when dashboard is undefined', () => {
        it('returns onSaveColumns as undefined', () => {
            const { result } = renderColumnsHook({
                customDashboardChartSchema: schema,
            })
            expect(result.current.onSaveColumns).toBeUndefined()
        })

        it('does not call the API when dashboard is absent', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const noRequestTimeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('no request')), 50),
            )

            renderColumnsHook({ customDashboardChartSchema: schema })

            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS + 50)
            })

            await expect(
                Promise.race([waitForRequest(jest.fn()), noRequestTimeout]),
            ).rejects.toThrow('no request')
        })
    })

    describe('when dashboard is provided', () => {
        it('returns onSaveColumns as a function', () => {
            const { result } = renderColumnsHook({
                customDashboardChartSchema: schema,
                dashboard,
            })
            expect(result.current.onSaveColumns).toBeInstanceOf(Function)
        })

        it('calling onSaveColumns sends visible columns as true in the PUT request', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const { result } = renderColumnsHook({
                customDashboardChartSchema: schema,
                dashboard,
            })

            act(() => {
                result.current.onSaveColumns!([
                    { column_id: 'col_a', visible: true },
                    { column_id: 'col_b', visible: true },
                ])
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
                                        { column_id: 'col_a', visible: true },
                                        { column_id: 'col_b', visible: true },
                                    ],
                                },
                            },
                        },
                    ],
                })
            })
        })

        it('calling onSaveColumns persists hidden columns as visible false in the PUT request', async () => {
            const waitForRequest = updateMock.waitForRequest(server)
            const { result } = renderColumnsHook({
                customDashboardChartSchema: schema,
                dashboard,
            })

            act(() => {
                result.current.onSaveColumns!([
                    { column_id: 'col_a', visible: true },
                    { column_id: 'col_b', visible: false },
                ])
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
                                        { column_id: 'col_a', visible: true },
                                        { column_id: 'col_b', visible: false },
                                    ],
                                },
                            },
                        },
                    ],
                })
            })
        })
    })
})
