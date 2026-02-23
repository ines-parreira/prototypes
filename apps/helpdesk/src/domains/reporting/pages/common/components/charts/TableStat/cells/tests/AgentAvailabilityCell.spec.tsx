import { AVAILABLE_STATUS } from '@repo/agent-status'
import { assumeMock } from '@repo/testing'
import { UserRole } from '@repo/utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockUpdateUserAvailabilityHandler } from '@gorgias/helpdesk-mocks'

import { AgentAvailabilityCell } from 'domains/reporting/pages/common/components/charts/TableStat/cells/AgentAvailabilityCell'
import * as useAvailabilityCellDataModule from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellData'
import { user } from 'fixtures/users'
import * as useNotifyModule from 'hooks/useNotify'
import type { useNotify } from 'hooks/useNotify'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore([thunk])

const server = setupServer()

const mockNotify: jest.Mocked<ReturnType<typeof useNotify>> = {
    error: jest.fn().mockResolvedValue(undefined),
    success: jest.fn().mockResolvedValue(undefined),
    info: jest.fn().mockResolvedValue(undefined),
    warning: jest.fn().mockResolvedValue(undefined),
    notify: jest.fn().mockResolvedValue(undefined),
}

jest.spyOn(useNotifyModule, 'useNotify').mockReturnValue(mockNotify)

jest.mock(
    'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellData',
)

const useAvailabilityCellDataMock = assumeMock(
    useAvailabilityCellDataModule.useAvailabilityCellData,
)

describe('AgentAvailabilityCell', () => {
    const userId = 123
    let queryClient: ReturnType<typeof mockQueryClient>
    let mockUpdateAvailability: ReturnType<
        typeof mockUpdateUserAvailabilityHandler
    >

    const defaultState = {
        currentUser: fromJS(user),
    }

    const renderComponent = (state = defaultState) =>
        render(
            <Provider store={mockStore(state)}>
                <QueryClientProvider client={queryClient}>
                    <AgentAvailabilityCell userId={userId} />
                </QueryClientProvider>
            </Provider>,
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'warn' })
    })

    beforeEach(() => {
        queryClient = mockQueryClient()

        // Default mock: available status, not loading, no errors
        useAvailabilityCellDataMock.mockReturnValue({
            availability: {
                user_id: userId,
                user_status: 'available',
                updated_datetime: '2024-01-01T00:00:00Z',
            },
            status: { ...AVAILABLE_STATUS, is_system: true },
            agentPhoneUnavailabilityStatus: undefined,
            isLoading: false,
            isError: false,
            isPhoneError: false,
        })

        mockUpdateAvailability = mockUpdateUserAvailabilityHandler()

        server.use(mockUpdateAvailability.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
        mockNotify.error.mockClear()
        mockNotify.success.mockClear()
        mockNotify.info.mockClear()
        mockNotify.warning.mockClear()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    describe('Rendering', () => {
        it('should render badge with current status name', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /Available/i }),
            ).toBeInTheDocument()
        })

        it('should render badge with dropdown indicator', () => {
            renderComponent()

            expect(screen.getByText('▾')).toBeInTheDocument()
        })

        it('should show loading skeleton when data is loading', () => {
            useAvailabilityCellDataMock.mockReturnValue({
                availability: undefined,
                status: undefined,
                agentPhoneUnavailabilityStatus: undefined,
                isLoading: true,
                isError: false,
                isPhoneError: false,
            })

            renderComponent()

            expect(screen.queryByText('Available')).not.toBeInTheDocument()
        })

        it('should show error state when there is an error', () => {
            useAvailabilityCellDataMock.mockReturnValue({
                availability: undefined,
                status: undefined,
                agentPhoneUnavailabilityStatus: undefined,
                isLoading: false,
                isError: true,
                isPhoneError: false,
            })

            renderComponent()

            expect(
                screen.getByText('Failed to load status'),
            ).toBeInTheDocument()
        })

        it('should show phone status badge when agent is on phone', () => {
            useAvailabilityCellDataMock.mockReturnValue({
                availability: {
                    user_id: userId,
                    user_status: 'available',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                status: AVAILABLE_STATUS,
                agentPhoneUnavailabilityStatus: {
                    id: 'on-phone',
                    name: 'On a call',
                    is_system: true,
                    duration_unit: 'minutes',
                    duration_value: 0,
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                isLoading: false,
                isError: false,
                isPhoneError: false,
            })

            renderComponent()

            expect(screen.getByText('On a call')).toBeInTheDocument()
            expect(screen.queryByText('Available')).not.toBeInTheDocument()
        })
    })

    describe('Status update', () => {
        it('should show error notification when status update fails', async () => {
            const user = userEvent.setup()

            // Mock the handler to return an error
            const { handler } = mockUpdateUserAvailabilityHandler(async () => {
                return HttpResponse.json(
                    { error: { msg: 'Failed to update status' } } as any,
                    { status: 500 },
                )
            })
            server.use(handler)

            renderComponent()

            const badge = screen.getByRole('button', { name: /Available/i })
            await user.click(badge)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /Unavailable/i }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('option', { name: /Unavailable/i }),
            )

            await waitFor(() => {
                expect(mockNotify.error).toHaveBeenCalledWith(
                    'Failed to update status. Please try again.',
                )
            })
        })
    })

    describe('Permissions', () => {
        it('should enable dropdown for admin users', async () => {
            const testUser = userEvent.setup()

            renderComponent()

            const badge = screen.getByRole('button', { name: /Available/i })
            expect(badge).not.toHaveAttribute('aria-disabled', 'true')

            await testUser.click(badge)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /Unavailable/i }),
                ).toBeInTheDocument()
            })
        })

        it('should disable dropdown for non-admin users', () => {
            const nonAdminUser = {
                ...user,
                role: { name: UserRole.Agent },
            }

            const nonAdminState = {
                currentUser: fromJS(nonAdminUser),
            }

            renderComponent(nonAdminState)

            const badge = screen.getByRole('button', { name: /Available/i })
            expect(badge).toBeDisabled()
        })

        it('should not open dropdown when non-admin user clicks', async () => {
            const testUser = userEvent.setup()

            const nonAdminUser = {
                ...user,
                role: { name: UserRole.Agent },
            }

            const nonAdminState = {
                currentUser: fromJS(nonAdminUser),
            }

            renderComponent(nonAdminState)

            const badge = screen.getByRole('button', { name: /Available/i })
            await testUser.click(badge)

            expect(
                screen.queryByRole('option', { name: /Unavailable/i }),
            ).not.toBeInTheDocument()
        })
    })
})
