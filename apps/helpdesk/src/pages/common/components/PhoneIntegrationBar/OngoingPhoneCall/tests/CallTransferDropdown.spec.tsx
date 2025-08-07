import { ComponentProps, createRef } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    act,
    cleanup,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Call } from '@twilio/voice-sdk'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import {
    mockListUsersHandler,
    mockTransferCallHandler,
} from '@gorgias/helpdesk-mocks'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockIncomingCall } from 'tests/twilioMocks'
import { mockStore } from 'utils/testing'

import CallTransferDropdown from '../CallTransferDropdown'
import {
    getAvailabilityBadgeColor,
    getAvailabilityStatus,
    mergeAgentData,
} from '../utils'

jest.mock('pages/common/utils/labels', () => ({
    AgentLabel: ({
        name,
        badgeColor,
        status,
    }: {
        name: string
        badgeColor?: string
        status?: string
    }) => (
        <div>
            {name}
            <div data-testid="badge">{badgeColor}</div>
            <div data-testid="status">{status}</div>
        </div>
    ),
}))
jest.mock('pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/utils')
jest.mock('state/notifications/actions')

const mockNotify = jest.mocked(notify)

const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const mockGetAvailabilityBadgeColor = getAvailabilityBadgeColor as jest.Mock
const mockGetAvailabilityStatus = getAvailabilityStatus as jest.Mock
const mockMergeAgentData = mergeAgentData as jest.Mock

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('CallTransferDropdown', () => {
    const setIsOpen = jest.fn()
    const onTransferInitiated = jest.fn()
    const mockListUsers = mockListUsersHandler()
    const mockTransferCall = mockTransferCallHandler()

    const baseProps = {
        isOpen: true,
        setIsOpen,
        onTransferInitiated,
        target: createRef<HTMLElement>(),
        call: mockIncomingCall() as Call,
    }

    const allAgents = [
        { id: 1, name: 'Agent 1', status: 'online' },
        { id: 2, name: 'Agent 2', status: 'online' },
        { id: 3, name: 'Agent 3', status: 'online' },
        { id: 4, name: 'Agent 4', status: 'online' },
    ]

    const renderComponent = (
        props: ComponentProps<typeof CallTransferDropdown> = baseProps,
    ) =>
        render(
            <Provider
                store={mockStore({
                    agents: fromJS({
                        all: allAgents,
                    }),
                    currentUser: fromJS({
                        id: 2,
                    }),
                } as any)}
            >
                <QueryClientProvider client={queryClient}>
                    <CallTransferDropdown {...props} />
                </QueryClientProvider>
            </Provider>,
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockListUsers.handler, mockTransferCall.handler)
        mockMergeAgentData.mockReturnValue(allAgents)
        mockNotify.mockReturnValue(jest.fn())

        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return true
            }
            return false
        })
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
        cleanup()
    })

    afterAll(() => {
        server.close()
    })

    it(`renders the dropdown body when isOpen is true and doesn't display current agent`, async () => {
        renderComponent()

        await waitFor(() => {
            expect(mockMergeAgentData).toHaveBeenCalledWith(
                allAgents.filter((agent) => agent.id !== 2),
                mockListUsers.data.data,
            )
        })
    })

    it('renders the dropdown body with the correct agent availability status', () => {
        mockGetAvailabilityBadgeColor.mockImplementation(
            (status: string) => status,
        )
        mockGetAvailabilityStatus.mockImplementation((status: string) => status)
        mockMergeAgentData.mockReturnValue([
            {
                id: 1,
                name: 'Agent 1',
                status: 'online',
            },
        ])

        renderComponent()

        const agent1 = screen.getByText('Agent 1')
        expect(agent1).toBeInTheDocument()
        expect(within(agent1).getByTestId('badge')).toHaveTextContent('online')
        expect(within(agent1).getByTestId('status')).toHaveTextContent('online')
    })

    it('does not render the dropdown body when isOpen is false', () => {
        renderComponent({ ...baseProps, isOpen: false })

        expect(screen.queryByText('Available')).not.toBeInTheDocument()
        expect(screen.queryByText('Unavailable')).not.toBeInTheDocument()
    })

    it('calls the setIsOpen function when the target element is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(() => user.click(screen.getByTestId('floating-overlay')))
        expect(setIsOpen).toHaveBeenCalled()
    })

    it(`doesn't select more than one agent`, async () => {
        const user = userEvent.setup()
        renderComponent()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        await act(() => user.click(agent1))
        expect(within(agent1).getByText(/done/i)).toBeVisible()

        const agent3 = screen.getByRole('option', {
            name: /agent 3/i,
        })
        await act(() => user.click(agent3))
        expect(within(agent3).getByText(/done/i)).toBeVisible()
        expect(within(agent1).queryByText(/done/i)).toBeNull()
    })

    it('only enables the transfer button when an agent is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        expect(
            screen.getByRole('button', { name: /transfer call/i }),
        ).toBeAriaDisabled()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        await act(() => user.click(agent1))
        expect(
            screen.getByRole('button', { name: /transfer call/i }),
        ).toBeAriaEnabled()
    })

    it('displays transfer button when agent is selected', async () => {
        renderComponent()

        await waitFor(() => {
            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeInTheDocument()
        })
    })

    it('calls the onTransferInitiated function when transfer succeeds', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            const agent1 = screen.getByRole('option', { name: /agent 1/i })
            return act(() => user.click(agent1))
        })

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        await act(() => user.click(transferButton))

        await waitFor(() => {
            expect(onTransferInitiated).toHaveBeenCalledWith(1)
            expect(setIsOpen).toHaveBeenCalledWith(false)
        })
    })

    it.each([
        {
            status: 400,
            errorMessage: { error: { msg: 'Transfer failed' } } as any,
            notifiedMessage: 'Transfer failed',
            notificationStatus: NotificationStatus.Info,
        },
        {
            status: 404,
            errorMessage: null,
            notifiedMessage:
                'Call transfer failed because an error occurred. Please try again.',
            notificationStatus: NotificationStatus.Error,
        },
    ])(
        'handles transfer failure',
        async ({
            status,
            errorMessage,
            notificationStatus,
            notifiedMessage,
        }) => {
            const user = userEvent.setup()
            const failedTransferHandler = mockTransferCallHandler(async () =>
                HttpResponse.json(errorMessage, {
                    status,
                    headers: { 'Content-Type': 'application/json' },
                }),
            )
            server.use(failedTransferHandler.handler)

            renderComponent()

            await waitFor(() => {
                const agent1 = screen.getByRole('option', { name: /agent 1/i })
                return act(() => user.click(agent1))
            })

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            await act(() => user.click(transferButton))

            await waitFor(() => {
                expect(onTransferInitiated).not.toHaveBeenCalled()
                expect(setIsOpen).not.toHaveBeenCalledWith(false)
                expect(mockNotify).toHaveBeenCalledWith({
                    status: notificationStatus,
                    message: notifiedMessage,
                })
            })
        },
    )

    it('allows transferring to selected agent', async () => {
        const user = userEvent.setup()
        renderComponent()

        await waitFor(() => {
            const agent1 = screen.getByRole('option', { name: /agent 1/i })
            return act(() => user.click(agent1))
        })

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        expect(transferButton).toBeAriaEnabled()
        await act(() => user.click(transferButton))
    })

    it('displays Available and Unavailable sections with correct counts', () => {
        mockMergeAgentData.mockReturnValue([
            { id: 1, name: 'Agent 1', status: 'online' },
            { id: 2, name: 'Agent 2', status: 'online' },
            { id: 3, name: 'Agent 3', status: 'online' },
            { id: 4, name: 'Agent 4', status: 'offline' },
        ])
        renderComponent()

        expect(screen.getByText('Available (3)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (1)')).toBeInTheDocument()
    })

    it('sections always render even when empty', () => {
        mockMergeAgentData.mockReturnValue([
            { id: 1, name: 'Agent 1', status: 'online' },
        ])
        renderComponent()

        expect(screen.getByText('Available (1)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (0)')).toBeInTheDocument()
    })

    it('disables agents in unavailable section', () => {
        mockMergeAgentData.mockReturnValue([
            { id: 1, name: 'Agent 1', status: 'online' },
            { id: 4, name: 'Agent 4', status: 'offline' },
        ])
        renderComponent()

        const availableAgent = screen.getByRole('option', { name: /agent 1/i })
        const unavailableAgent = screen.getByRole('option', {
            name: /agent 4/i,
        })

        expect(availableAgent.className).not.toContain('disabled')
        expect(unavailableAgent.className).toContain('disabled')
    })

    describe('transfer to external number FF off', () => {
        beforeEach(() => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                    return false
                }
                return false
            })
        })

        it('does not show grouped headers', () => {
            mockMergeAgentData.mockReturnValue([
                { id: 1, name: 'Agent 1', status: 'online' },
                { id: 2, name: 'Agent 2', status: 'online' },
                { id: 3, name: 'Agent 3', status: 'online' },
                { id: 4, name: 'Agent 4', status: 'offline' },
            ])
            const { getByText, queryByText } = renderComponent()

            expect(getByText('Agents')).toBeInTheDocument()
            expect(queryByText('Available')).not.toBeInTheDocument()
            expect(queryByText('Unavailable')).not.toBeInTheDocument()
        })
    })
})
