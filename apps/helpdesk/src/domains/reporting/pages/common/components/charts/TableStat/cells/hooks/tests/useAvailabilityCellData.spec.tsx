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
    mockGetUserAvailabilityHandler,
    mockGetUserPhoneStatusHandler,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockUserAvailabilityDetail,
    mockUserPhoneStatus,
} from '@gorgias/helpdesk-mocks'
import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useAvailabilityCellData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellData'
import { user } from 'fixtures/users'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore([thunk])
const server = setupServer()

describe('useAvailabilityCellData', () => {
    const userId = 123
    const userIds = [123, 456, 789]
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
        renderHook(() => useAvailabilityCellData({ userId }), {
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

        // Set up default phone status handler (off-call = no special status)
        // Individual tests can override this by calling server.use() with their own handler
        const defaultPhoneStatusHandler = mockGetUserPhoneStatusHandler(
            async () =>
                HttpResponse.json(
                    mockUserPhoneStatus({
                        user_id: userId,
                        phone_status: 'off-call',
                    }),
                ),
        )
        server.use(defaultPhoneStatusHandler.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    describe('Loading states', () => {
        it('should return isLoading: true when batch query is loading', () => {
            const mockListAvailabilities = mockListUserAvailabilitiesHandler()
            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            server.use(mockListAvailabilities.handler, mockListStatuses.handler)

            const { result } = renderHookWithProviders()

            expect(result.current.isLoading).toBe(true)
            expect(result.current.status).toBeUndefined()
            expect(result.current.isPhoneError).toBe(false)
        })

        it('should return isLoading: false when batch query completes and data is in cache', async () => {
            const mockListAvailabilities = mockListUserAvailabilitiesHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [
                            mockUserAvailabilityDetail({
                                user_id: userId,
                                user_status: 'available',
                                updated_datetime: '2026-02-09T12:00:00.000Z',
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

            // First, populate the cache with batch query
            queryClient.setQueryData(
                queryKeys.userAvailability.listUserAvailabilities({
                    user_id: userIds,
                }),
                {
                    data: {
                        data: [
                            mockUserAvailabilityDetail({
                                user_id: userId,
                                user_status: 'available',
                            }),
                        ],
                    },
                },
            )

            // Also set individual cache
            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.status).toBeDefined()
            expect(result.current.status?.id).toBe('available')
            expect(result.current.isError).toBe(false)
            expect(result.current.isPhoneError).toBe(false)
        })
    })

    describe('Error states', () => {
        it('should return isError: false when batch query fails but cached data exists', async () => {
            const mockListAvailabilities = mockListUserAvailabilitiesHandler(
                async () =>
                    HttpResponse.json(
                        { error: { msg: 'Failed to fetch' } } as any,
                        { status: 500 },
                    ),
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

            // Set cached data first
            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.status).toBeDefined()
            })

            expect(result.current.isError).toBe(false)
            expect(result.current.status?.id).toBe('available')
            expect(result.current.isPhoneError).toBe(false)
        })

        it('should set isPhoneError when phone status query fails', async () => {
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
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () =>
                    HttpResponse.json(
                        {
                            error: { msg: 'Failed to fetch phone status' },
                        } as any,
                        { status: 500 },
                    ),
            )

            server.use(
                mockListAvailabilities.handler,
                mockListStatuses.handler,
                mockGetUserPhoneStatus.handler,
            )

            // Set availability in cache
            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.isPhoneError).toBe(true)
            })

            // Availability should still be loaded and not show error
            expect(result.current.status).toBeDefined()
            expect(result.current.isError).toBe(false)
            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
        })
    })

    describe('Phone status precedence', () => {
        it('should return phone status when agent is on phone', async () => {
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
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            const mockPhoneStatus = mockUserPhoneStatus({
                user_id: userId,
                phone_status: 'on-call',
            })

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(mockPhoneStatus),
            )

            server.use(
                mockListAvailabilities.handler,
                mockListStatuses.handler,
                mockGetUserPhoneStatus.handler,
            )

            // Set availability in cache
            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            // Wait for phone status to load
            await waitFor(() => {
                expect(
                    result.current.agentPhoneUnavailabilityStatus,
                ).toBeDefined()
            })

            // Phone status should be present when agent is on call
            expect(result.current.agentPhoneUnavailabilityStatus?.name).toBe(
                'On a call',
            )
            expect(result.current.isPhoneError).toBe(false)
        })

        it('should return undefined phone status when agent is off call', async () => {
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
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            const mockPhoneStatus = mockUserPhoneStatus({
                user_id: userId,
                phone_status: 'off-call',
            })

            const mockGetUserPhoneStatus = mockGetUserPhoneStatusHandler(
                async () => HttpResponse.json(mockPhoneStatus),
            )

            server.use(
                mockListAvailabilities.handler,
                mockListStatuses.handler,
                mockGetUserPhoneStatus.handler,
            )

            // Set availability in cache
            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            // Phone status should be undefined when off call
            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
            expect(result.current.isPhoneError).toBe(false)
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
                                updated_datetime: '2026-02-09T12:00:00.000Z',
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

            // Set cached data
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
            expect(result.current.isError).toBe(false)
            expect(result.current.isPhoneError).toBe(false)
        })
    })

    describe('Cache-only behavior', () => {
        it('should not make network request when reading from cache', async () => {
            const getUserAvailabilitySpy = jest.fn()
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async ({ data }) => {
                    getUserAvailabilitySpy()
                    return HttpResponse.json(data)
                },
            )

            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            server.use(
                mockGetUserAvailability.handler,
                mockListStatuses.handler,
            )

            // Pre-populate cache
            queryClient.setQueryData(
                queryKeys.userAvailability.getUserAvailability(userId),
                {
                    data: mockUserAvailabilityDetail({
                        user_id: userId,
                        user_status: 'available',
                    }) as UserAvailability,
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(getUserAvailabilitySpy).not.toHaveBeenCalled()
            })

            expect(result.current.isError).toBe(false)
            expect(result.current.isPhoneError).toBe(false)
        })
    })
})
