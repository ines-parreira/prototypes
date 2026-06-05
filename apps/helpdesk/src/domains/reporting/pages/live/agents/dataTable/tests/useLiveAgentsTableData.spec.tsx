import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockListUsersHandler,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useLiveAgentsTableData } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsTableData'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { userPerformanceOverview } from 'fixtures/stats'
import type { RootState } from 'state/types'

const USERS = Array.from({ length: 30 }, (_, index) => {
    const id = index + 1
    return { id, name: `Agent ${String(id).padStart(2, '0')}`, active: true }
})

const allAgentIds = Array.from({ length: 30 }, (_, index) => index + 1)

const server = setupServer()

let requestedAgents: number[] | undefined

const storeState = {
    currentUser: fromJS({ timezone: 'Europe/Paris' }),
    stats: {
        filters: {
            period: {
                start_datetime: '2021-02-03T00:00:00.000Z',
                end_datetime: '2021-02-03T23:59:59.999Z',
            },
        },
    },
    ui: { stats: { filters: uiFiltersInitialState } },
    entities: { tags: {} },
} as unknown as RootState

describe('useLiveAgentsTableData', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

    beforeEach(() => {
        requestedAgents = undefined
        const defaultUsers = mockListUsersHandler()
        const defaultAvailabilities = mockListUserAvailabilitiesHandler()
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json({
                    ...defaultUsers.data,
                    data: USERS,
                    meta: {
                        ...defaultUsers.data.meta,
                        next_cursor: null,
                        prev_cursor: null,
                    },
                }),
            ).handler,
            mockListUserAvailabilitiesHandler(async () =>
                HttpResponse.json({
                    ...defaultAvailabilities.data,
                    data: [],
                    meta: {
                        ...defaultAvailabilities.data.meta,
                        next_cursor: null,
                        prev_cursor: null,
                    },
                }),
            ).handler,
            mockListCustomUserAvailabilityStatusesHandler(
                async ({ data: body }) =>
                    HttpResponse.json({ ...body, data: [] }),
            ).handler,
            http.post(
                '*/api/stats/users-performance-overview/',
                async ({ request }) => {
                    const body = (await request.json()) as {
                        filters: { agents: number[] }
                    }
                    requestedAgents = body.filters.agents
                    return HttpResponse.json(userPerformanceOverview)
                },
            ),
        )
    })

    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('exposes every agent as a row and fetches stats for all agents at once', async () => {
        const { result } = renderHook(() => useLiveAgentsTableData(), {
            storeState,
        })

        // The full (sorted, filtered) agent list is the table data; the
        // DataTable paginates it client-side. Stats are fetched for every agent
        // at once so the metric columns can be sorted across the whole dataset.
        await waitFor(() => expect(result.current.rows).toHaveLength(30))
        await waitFor(() => expect(requestedAgents).toEqual(allAgentIds))

        expect(result.current.rows[0]).toMatchObject({
            userId: 1,
            userName: 'Agent 01',
        })
    })

    it('exposes the metric columns before the stats resolve to avoid layout shift', async () => {
        const { result } = renderHook(() => useLiveAgentsTableData(), {
            storeState,
        })

        // Placeholder metric axes are present on the first render — before the
        // stats resolve — so the column set stays stable instead of the metric
        // columns shifting in once the request completes.
        expect(result.current.metricAxes.map((axis) => axis.name)).toEqual([
            'Tickets closed',
            'Messages sent',
            'Open tickets',
        ])

        await waitFor(() => expect(result.current.rows).toHaveLength(30))

        // Once stats load, the real axes from the response back the same
        // columns.
        expect(result.current.metricAxes.map((axis) => axis.name)).toEqual([
            'Tickets closed',
            'Messages sent',
            'Open tickets',
        ])
    })

    it('defaults to sorting online agents first', async () => {
        const { result } = renderHook(() => useLiveAgentsTableData(), {
            storeState,
        })

        await waitFor(() => expect(result.current.rows).toHaveLength(30))

        expect(result.current.sorting).toEqual([
            { id: 'onlineStatus', desc: true },
        ])
    })

    it('narrows the visible rows to the search query (client-side)', async () => {
        const { result } = renderHook(() => useLiveAgentsTableData(), {
            storeState,
        })

        await waitFor(() => expect(result.current.rows).toHaveLength(30))
        // Stats are fetched once for every agent, so search filters the rows
        // client-side without changing the stats request.
        await waitFor(() => expect(requestedAgents).toEqual(allAgentIds))

        act(() => {
            result.current.onSearchChange('Agent 07')
        })

        await waitFor(() => expect(result.current.rows).toHaveLength(1))
        expect(result.current.rows[0]).toMatchObject({ userId: 7 })
        expect(requestedAgents).toEqual(allAgentIds)
    })

    it('sorts the availability column alphabetically by status name', async () => {
        const walkingDog = mockCustomUserAvailabilityStatus({
            id: 'walking-dog',
            name: 'Walking Dog',
        })
        const meetings = mockCustomUserAvailabilityStatus({
            id: 'meetings',
            name: 'Meetings',
        })

        server.use(
            mockListUserAvailabilitiesHandler(async () =>
                HttpResponse.json(
                    mockListUserAvailabilitiesResponse({
                        data: [
                            mockUserAvailability({
                                user_id: 1,
                                user_status: 'custom',
                                custom_user_availability_status_id:
                                    walkingDog.id,
                            }),
                            mockUserAvailability({
                                user_id: 2,
                                user_status: 'custom',
                                custom_user_availability_status_id: meetings.id,
                            }),
                            mockUserAvailability({
                                user_id: 3,
                                user_status: 'available',
                            }),
                        ],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                            total_resources: 3,
                        },
                    }),
                ),
            ).handler,
            mockListCustomUserAvailabilityStatusesHandler(
                async ({ data: body }) =>
                    HttpResponse.json({
                        ...body,
                        data: [walkingDog, meetings],
                    }),
            ).handler,
        )

        const { result } = renderHook(() => useLiveAgentsTableData(), {
            storeState,
        })

        await waitFor(() => expect(result.current.rows).toHaveLength(30))

        act(() => {
            result.current.onSortingChange([
                { id: 'availability', desc: false },
            ])
        })

        // Alphabetical by the resolved status name: Available (agent 3),
        // Meetings (agent 2), Walking Dog (agent 1). The raw `user_status` is
        // "custom" for both custom statuses, so sorting by it would leave agents
        // 1 and 2 in input order ([3, 1, 2]) instead of by their labels.
        await waitFor(() =>
            expect(
                result.current.rows.slice(0, 3).map((row) => row.userId),
            ).toEqual([3, 2, 1]),
        )
    })
})
