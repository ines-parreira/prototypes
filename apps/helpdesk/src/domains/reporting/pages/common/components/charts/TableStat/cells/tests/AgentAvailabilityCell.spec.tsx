import type React from 'react'

import { AVAILABLE_STATUS } from '@repo/agent-status'
import { UserRole } from '@repo/permissions'
import { assumeMock, render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
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

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ children }: { children?: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipTrigger: ({ children }: { children?: React.ReactNode }) => (
        <>{children}</>
    ),
}))

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
            isOnActiveCall: false,
            isLoading: false,
            hasNoData: false,
            isLoadingAny: false,
            errorMessage: null,
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
                isOnActiveCall: false,
                isLoading: true,
                hasNoData: true,
                isLoadingAny: true,
                errorMessage: null,
            })

            renderComponent()

            expect(screen.queryByText('Available')).not.toBeInTheDocument()
        })

        it('should show error state when there is an error', () => {
            const errorMsg = 'Failed to load availability status'
            useAvailabilityCellDataMock.mockReturnValue({
                availability: undefined,
                status: undefined,
                agentPhoneUnavailabilityStatus: undefined,
                isOnActiveCall: false,
                isLoading: false,
                hasNoData: true,
                isLoadingAny: false,
                errorMessage: errorMsg,
            })

            renderComponent()

            const warningIcon = screen.getByLabelText('warning-triangle')
            expect(warningIcon).toBeInTheDocument()

            expect(screen.getByText(errorMsg)).toBeInTheDocument()
        })

        it('should show phone status badge when agent is on an active call', () => {
            useAvailabilityCellDataMock.mockReturnValue({
                availability: {
                    user_id: userId,
                    user_status: 'available',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                status: AVAILABLE_STATUS,
                agentPhoneUnavailabilityStatus: {
                    id: 'on-a-call',
                    name: 'On a call',
                    is_system: true,
                    duration_unit: 'minutes',
                    duration_value: 0,
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                isOnActiveCall: true,
                isLoading: false,
                hasNoData: false,
                isLoadingAny: false,
                errorMessage: null,
            })

            renderComponent()

            expect(screen.getByText('On a call')).toBeInTheDocument()
            expect(screen.queryByText('Available')).not.toBeInTheDocument()
        })

        it('should show status picker during wrap-up so admins can change agent status', () => {
            useAvailabilityCellDataMock.mockReturnValue({
                availability: {
                    user_id: userId,
                    user_status: 'available',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                status: AVAILABLE_STATUS,
                agentPhoneUnavailabilityStatus: {
                    id: 'call-wrap-up',
                    name: 'Call wrap-up',
                    is_system: true,
                    duration_unit: 'minutes',
                    duration_value: 0,
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                isOnActiveCall: false,
                isLoading: false,
                hasNoData: false,
                isLoadingAny: false,
                errorMessage: null,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /Call wrap-up/i }),
            ).toBeInTheDocument()
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

        it('should enable dropdown for team lead users', async () => {
            const testUser = userEvent.setup()

            const teamLeadUser = {
                ...user,
                role: { name: UserRole.Agent },
            }

            const teamLeadState = {
                currentUser: fromJS(teamLeadUser),
            }

            renderComponent(teamLeadState)

            const badge = screen.getByRole('button', { name: /Available/i })
            expect(badge).not.toHaveAttribute('aria-disabled', 'true')

            await testUser.click(badge)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /Unavailable/i }),
                ).toBeInTheDocument()
            })
        })

        it('should disable dropdown for non-admin, non-team-lead users', () => {
            const basicAgentUser = {
                ...user,
                role: { name: UserRole.BasicAgent },
            }

            const basicAgentState = {
                currentUser: fromJS(basicAgentUser),
            }

            renderComponent(basicAgentState)

            const badge = screen.getByRole('button', { name: /Available/i })
            expect(badge).toBeDisabled()
        })

        it('should not open dropdown when non-admin, non-team-lead user clicks', async () => {
            const testUser = userEvent.setup()

            const basicAgentUser = {
                ...user,
                role: { name: UserRole.BasicAgent },
            }

            const basicAgentState = {
                currentUser: fromJS(basicAgentUser),
            }

            renderComponent(basicAgentState)

            const badge = screen.getByRole('button', { name: /Available/i })
            await testUser.click(badge)

            expect(
                screen.queryByRole('option', { name: /Unavailable/i }),
            ).not.toBeInTheDocument()
        })
    })
})
