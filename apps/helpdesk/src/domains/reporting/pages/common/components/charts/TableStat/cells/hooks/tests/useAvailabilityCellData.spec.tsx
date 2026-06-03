import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockCustomUserAvailabilityStatus,
    mockGetUserPhoneStatusHandler,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockListUserPhoneStatusHandler,
    mockUserAvailability,
    mockUserAvailabilityDetail,
    mockUserPhoneStatus,
} from '@gorgias/helpdesk-mocks'
import type { UserAvailability } from '@gorgias/helpdesk-queries'

import * as useAvailabilityCellAvailabilityDataModule from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellAvailabilityData'
import { useAvailabilityCellData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellData'
import * as useAvailabilityCellPhoneStatusDataModule from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellPhoneStatusData'
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

        const defaultListPhoneStatusesHandler = mockListUserPhoneStatusHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: userIds.map((id) =>
                        mockUserPhoneStatus({
                            user_id: id,
                            phone_status: 'off-call',
                        }),
                    ),
                }),
        )

        server.use(
            defaultPhoneStatusHandler.handler,
            defaultListPhoneStatusesHandler.handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
        jest.restoreAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    describe('Data resolution', () => {
        it('should show availability status when data loads', async () => {
            const mockAvailability = mockUserAvailabilityDetail({
                user_id: userId,
                user_status: 'available',
            }) as UserAvailability

            jest.spyOn(
                useAvailabilityCellAvailabilityDataModule,
                'useAvailabilityCellAvailabilityData',
            ).mockReturnValue({
                availability: undefined,
                status: undefined,
            })

            jest.spyOn(
                useAvailabilityCellPhoneStatusDataModule,
                'useAvailabilityCellPhoneStatusData',
            ).mockReturnValue({
                agentPhoneUnavailabilityStatus: undefined,
                isOnActiveCall: false,
                isLoading: true,
                isError: false,
            })

            const { result, rerender } = renderHookWithProviders()

            expect(result.current.isLoading).toBe(true)
            expect(result.current.status).toBeUndefined()
            expect(result.current.errorMessage).toBeNull()

            jest.spyOn(
                useAvailabilityCellAvailabilityDataModule,
                'useAvailabilityCellAvailabilityData',
            ).mockReturnValue({
                availability: mockAvailability,
                status: { id: 'available', name: 'Available' } as any,
            })

            jest.spyOn(
                useAvailabilityCellPhoneStatusDataModule,
                'useAvailabilityCellPhoneStatusData',
            ).mockReturnValue({
                agentPhoneUnavailabilityStatus: undefined,
                isOnActiveCall: false,
                isLoading: false,
                isError: false,
            })

            rerender()

            expect(result.current.isLoading).toBe(false)
            expect(result.current.status?.id).toBe('available')
            expect(result.current.errorMessage).toBeNull()
        })

        it('should resolve availability status from the shared availability list', async () => {
            const mockListAvailabilities = mockListUserAvailabilitiesHandler(
                async () =>
                    HttpResponse.json(
                        mockListUserAvailabilitiesResponse({
                            data: [
                                mockUserAvailability({
                                    user_id: userId,
                                    user_status: 'available',
                                }),
                            ],
                            meta: {
                                prev_cursor: null,
                                next_cursor: null,
                                total_resources: 1,
                            },
                        }),
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

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.status).toBeDefined()
            })

            expect(result.current.status?.id).toBe('available')
            expect(result.current.errorMessage).toBeNull()
        })
    })

    describe('Error states', () => {
        it('should show graceful degradation when phone status fails but availability succeeds', () => {
            // Mock availability hook as successful
            const mockAvailability = mockUserAvailabilityDetail({
                user_id: userId,
                user_status: 'available',
            }) as UserAvailability

            jest.spyOn(
                useAvailabilityCellAvailabilityDataModule,
                'useAvailabilityCellAvailabilityData',
            ).mockReturnValue({
                availability: mockAvailability,
                status: { id: 'available', name: 'Available' } as any,
            })

            // Mock phone status hook as failed
            jest.spyOn(
                useAvailabilityCellPhoneStatusDataModule,
                'useAvailabilityCellPhoneStatusData',
            ).mockReturnValue({
                agentPhoneUnavailabilityStatus: undefined,
                isOnActiveCall: false,
                isLoading: false,
                isError: true,
            })

            const { result } = renderHookWithProviders()

            // Graceful degradation: show availability status with error message
            expect(result.current.status).toBeDefined()
            expect(result.current.status?.id).toBe('available')
            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
            expect(result.current.errorMessage).toBe(
                'Failed to load phone status',
            )
            expect(result.current.isLoading).toBe(false)
        })
    })
})
