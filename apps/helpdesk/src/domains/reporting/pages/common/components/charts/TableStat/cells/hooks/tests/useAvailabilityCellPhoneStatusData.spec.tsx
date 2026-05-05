import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockUserPhoneStatus } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useAvailabilityCellPhoneStatusData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellPhoneStatusData'
import * as usePerformancePageAgentPhoneStatusesModule from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentPhoneStatuses'
import { user } from 'fixtures/users'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore([thunk])
const server = setupServer()

// Mock the batch query hook
jest.mock(
    'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentPhoneStatuses',
)

describe('useAvailabilityCellPhoneStatusData', () => {
    const userId = 123
    let queryClient: ReturnType<typeof mockQueryClient>

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
        renderHook(() => useAvailabilityCellPhoneStatusData({ userId }), {
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

        // Default mock: batch query is not loading and has no error
        jest.spyOn(
            usePerformancePageAgentPhoneStatusesModule,
            'usePerformancePageAgentPhoneStatuses',
        ).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as ReturnType<
            typeof usePerformancePageAgentPhoneStatusesModule.usePerformancePageAgentPhoneStatuses
        >)
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    describe('Phone status resolution', () => {
        it('should show on-call status when agent is on a call', async () => {
            jest.spyOn(
                usePerformancePageAgentPhoneStatusesModule,
                'usePerformancePageAgentPhoneStatuses',
            ).mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
            } as ReturnType<
                typeof usePerformancePageAgentPhoneStatusesModule.usePerformancePageAgentPhoneStatuses
            >)

            const { result, rerender } = renderHookWithProviders()

            expect(result.current.isLoading).toBe(true)
            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()

            queryClient.setQueryData(
                queryKeys.voiceUserStatus.getUserPhoneStatus(userId),
                {
                    data: mockUserPhoneStatus({
                        user_id: userId,
                        phone_status: 'on-call',
                    }),
                },
            )

            rerender()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.agentPhoneUnavailabilityStatus?.name).toBe(
                'On a call',
            )
            expect(result.current.isOnActiveCall).toBe(true)
            expect(result.current.isError).toBe(false)
        })

        it('should return wrap-up status with isOnActiveCall false during wrap-up', async () => {
            queryClient.setQueryData(
                queryKeys.voiceUserStatus.getUserPhoneStatus(userId),
                {
                    data: mockUserPhoneStatus({
                        user_id: userId,
                        phone_status: 'wrapping-up',
                    }),
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.agentPhoneUnavailabilityStatus?.name).toBe(
                'Call wrap-up',
            )
            expect(result.current.isOnActiveCall).toBe(false)
            expect(result.current.isError).toBe(false)
        })

        it('should return no phone status when agent is off-call', async () => {
            queryClient.setQueryData(
                queryKeys.voiceUserStatus.getUserPhoneStatus(userId),
                {
                    data: mockUserPhoneStatus({
                        user_id: userId,
                        phone_status: 'off-call',
                    }),
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
            expect(result.current.isOnActiveCall).toBe(false)
            expect(result.current.isError).toBe(false)
        })
    })

    describe('Error handling', () => {
        it('should show error when batch query fails and no cached data', () => {
            jest.spyOn(
                usePerformancePageAgentPhoneStatusesModule,
                'usePerformancePageAgentPhoneStatuses',
            ).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: new Error('Failed to fetch phone status'),
            } as ReturnType<
                typeof usePerformancePageAgentPhoneStatusesModule.usePerformancePageAgentPhoneStatuses
            >)

            const { result } = renderHookWithProviders()

            expect(result.current.isError).toBe(true)
            expect(
                result.current.agentPhoneUnavailabilityStatus,
            ).toBeUndefined()
            expect(result.current.isLoading).toBe(false)
        })

        it('should show cached phone status even when batch query fails', async () => {
            queryClient.setQueryData(
                queryKeys.voiceUserStatus.getUserPhoneStatus(userId),
                {
                    data: mockUserPhoneStatus({
                        user_id: userId,
                        phone_status: 'on-call',
                    }),
                },
            )

            const { result } = renderHookWithProviders()

            await waitFor(() => {
                expect(
                    result.current.agentPhoneUnavailabilityStatus,
                ).toBeDefined()
            })

            expect(result.current.isError).toBe(false)
            expect(result.current.agentPhoneUnavailabilityStatus?.name).toBe(
                'On a call',
            )
        })
    })
})
