import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockUserAvailabilityDetail,
} from '@gorgias/helpdesk-mocks'
import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useAvailabilityCellAvailabilityData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellAvailabilityData'
import { user } from 'fixtures/users'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore([thunk])
const server = setupServer()

describe('useAvailabilityCellAvailabilityData', () => {
    const userId = 123
    let queryClient: ReturnType<typeof mockQueryClient>

    const customStatus = mockCustomUserAvailabilityStatus({
        id: 'custom-123',
        name: 'Lunch Break',
        duration_unit: 'minutes',
        duration_value: 30,
    })

    const defaultState = {
        currentUser: fromJS(user),
        entities: {
            stats: {
                'live-agents-stat': fromJS({
                    data: {
                        lines: [
                            [{ value: { id: 123, name: 'Agent 1' } }],
                            [{ value: { id: 456, name: 'Agent 2' } }],
                            [{ value: { id: 789, name: 'Agent 3' } }],
                        ],
                    },
                }),
            },
        },
    }

    const renderHookWithProviders = (state = defaultState) =>
        renderHook(() => useAvailabilityCellAvailabilityData({ userId }), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </Provider>
            ),
        })

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'warn' })
    })

    beforeEach(() => {
        queryClient = mockQueryClient()
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    describe('Standard status resolution', () => {
        it('should resolve standard status from cache', async () => {
            const mockListAvailabilities = mockListUserAvailabilitiesHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [
                            mockUserAvailabilityDetail({
                                user_id: userId,
                                user_status: 'available',
                            }) as UserAvailability,
                        ],
                    }),
            )

            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({ ...data, data: [] }),
                )

            server.use(mockListAvailabilities.handler, mockListStatuses.handler)

            const { result } = renderHookWithProviders()

            expect(result.current.isLoading).toBe(true)
            expect(result.current.status).toBeUndefined()

            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.status?.id).toBe('available')
        })
    })

    describe('Custom status resolution', () => {
        it('should resolve custom status from custom status list', async () => {
            const mockListAvailabilities = mockListUserAvailabilitiesHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [
                            mockUserAvailabilityDetail({
                                user_id: userId,
                                user_status: 'custom',
                                custom_user_availability_status_id:
                                    customStatus.id,
                            }) as UserAvailability,
                        ],
                    }),
            )

            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            server.use(mockListAvailabilities.handler, mockListStatuses.handler)

            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'custom',
                        custom_user_availability_status_id: customStatus.id,
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.status).toBeDefined()
            })

            expect(result.current.status?.id).toBe(customStatus.id)
            expect(result.current.status?.name).toBe('Lunch Break')
        })
    })
})
