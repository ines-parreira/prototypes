import { ComponentProps, createRef } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Call } from '@twilio/voice-sdk'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import { mockTransferCallHandler } from '@gorgias/helpdesk-mocks'
import { VoiceCallTransferReceiverType } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import CallTransferDropdown from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/CallTransferDropdown'
import { TransferType } from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockIncomingCall } from 'tests/twilioMocks'
import { mockStore } from 'utils/testing'

jest.mock(
    'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/AgentCallTransferDropdownContent',
    () => ({
        __esModule: true,
        default: ({ setSelectedAgentId, clearErrors }: any) => {
            return (
                <div data-testid="agent-transfer-content">
                    <button
                        onClick={() => setSelectedAgentId(1)}
                        aria-label="Select Agent 1"
                    >
                        Agent 1
                    </button>
                    <button
                        onClick={() => clearErrors()}
                        aria-label="Clear errors"
                    >
                        Clear
                    </button>
                </div>
            )
        },
    }),
)

jest.mock(
    'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/ExternalCallTransferDropdownContent',
    () => ({
        __esModule: true,
        default: ({ setSelectedExternalPhoneNumber }: any) => {
            return (
                <div data-testid="external-transfer-content">
                    <button
                        onClick={() =>
                            setSelectedExternalPhoneNumber('+15551234567', null)
                        }
                        aria-label="Set external number"
                    >
                        Set External
                    </button>
                </div>
            )
        },
    }),
)

jest.mock('state/notifications/actions')

const mockNotify = jest.mocked(notify)

const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('CallTransferDropdown', () => {
    const setIsOpen = jest.fn()
    const onTransferInitiated = jest.fn()
    const mockTransferCall = mockTransferCallHandler()

    const baseProps = {
        isOpen: true,
        setIsOpen,
        onTransferInitiated,
        target: createRef<HTMLElement>(),
        call: mockIncomingCall() as Call,
    }

    const renderComponent = (
        props: ComponentProps<typeof CallTransferDropdown> = baseProps,
    ) =>
        render(
            <Provider store={mockStore({} as any)}>
                <QueryClientProvider client={queryClient}>
                    <CallTransferDropdown {...props} />
                </QueryClientProvider>
            </Provider>,
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockTransferCall.handler)
        mockNotify.mockReturnValue(jest.fn())
        jest.clearAllMocks()

        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return true
            }
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

    it('does not render the dropdown body when isOpen is false', () => {
        renderComponent({ ...baseProps, isOpen: false })

        expect(screen.queryByText('Available')).not.toBeInTheDocument()
        expect(screen.queryByText('Unavailable')).not.toBeInTheDocument()
    })

    it('calls the setIsOpen function when the dropdown overlay is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(() => user.click(screen.getByTestId('floating-overlay')))
        expect(setIsOpen).toHaveBeenCalled()
    })

    it('displays transfer button', () => {
        renderComponent()

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        expect(transferButton).toBeInTheDocument()
    })

    it('handles error notification and shows alert banner on transfer failure', async () => {
        const user = userEvent.setup()
        const failedTransferHandler = mockTransferCallHandler(async () =>
            HttpResponse.json({ error: { msg: 'Transfer failed' } } as any, {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }),
        )
        server.use(failedTransferHandler.handler)

        renderComponent()

        // Select an agent to enable transfer
        const selectAgent = screen.getByLabelText(/select agent 1/i)
        await act(() => user.click(selectAgent))

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        await act(() => user.click(transferButton))

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Warning,
                message: 'Transfer failed',
            })
            expect(
                screen.getByText('Transfer unsuccessful. Please try again.'),
            ).toBeInTheDocument()
        })
    })

    it('renders toggle button with Agents and External options', () => {
        renderComponent()

        expect(
            screen.getByRole('radio', { name: /agents/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /external/i }),
        ).toBeInTheDocument()
    })

    it('only enables the transfer button when a target is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        expect(
            screen.getByRole('button', { name: /transfer call/i }),
        ).toBeAriaDisabled()

        const selectAgent = screen.getByLabelText(/select agent 1/i)
        await act(() => user.click(selectAgent))
        expect(
            screen.getByRole('button', { name: /transfer call/i }),
        ).toBeAriaEnabled()
    })

    it('transfers call to selected agent', async () => {
        const user = userEvent.setup()
        const waitForTransferRequest = mockTransferCall.waitForRequest(server)
        renderComponent()

        const selectAgent = screen.getByLabelText(/select agent 1/i)
        await act(() => user.click(selectAgent))

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        await act(() => user.click(transferButton))

        await waitForTransferRequest(async (request) => {
            const body = await request.json()
            expect(body.receiver_type).toBe(VoiceCallTransferReceiverType.Agent)
            expect(body.receiver_id).toBe(1)
        })

        await waitFor(() => {
            expect(onTransferInitiated).toHaveBeenCalledWith({
                type: TransferType.Agent,
                id: 1,
            })
            expect(setIsOpen).toHaveBeenCalledWith(false)
        })
    })

    it('clears alert banner when clear errors is called', async () => {
        const user = userEvent.setup()
        const failedTransferHandler = mockTransferCallHandler(async () =>
            HttpResponse.json({ error: { msg: 'Transfer failed' } } as any, {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }),
        )
        server.use(failedTransferHandler.handler)

        renderComponent()

        // Select an agent and trigger transfer failure
        const selectAgent = screen.getByLabelText(/select agent 1/i)
        await act(() => user.click(selectAgent))

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        await act(() => user.click(transferButton))

        await waitFor(() => {
            expect(
                screen.getByText('Transfer unsuccessful. Please try again.'),
            ).toBeInTheDocument()
        })

        // Click clear errors button
        const clearButton = screen.getByLabelText(/clear errors/i)
        await act(() => user.click(clearButton))

        expect(
            screen.queryByText('Transfer unsuccessful. Please try again.'),
        ).not.toBeInTheDocument()
    })

    it('shows external transfer content when External tab is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        const externalTab = screen.getByRole('radio', { name: /external/i })
        await act(() => user.click(externalTab))

        expect(
            screen.getByTestId('external-transfer-content'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('agent-transfer-content'),
        ).not.toBeInTheDocument()
    })

    it('transfers call to external number', async () => {
        const user = userEvent.setup()
        const waitForTransferRequest = mockTransferCall.waitForRequest(server)
        renderComponent()

        const externalTab = screen.getByRole('radio', { name: /external/i })
        await act(() => user.click(externalTab))

        const setExternal = screen.getByLabelText(/set external number/i)
        await act(() => user.click(setExternal))

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        await act(() => user.click(transferButton))

        await waitForTransferRequest(async (request) => {
            const body = await request.json()
            expect(body.receiver_type).toBe(
                VoiceCallTransferReceiverType.External,
            )
            expect(body.receiver_value).toBe('+15551234567')
        })

        await waitFor(() => {
            expect(onTransferInitiated).toHaveBeenCalledWith({
                type: TransferType.External,
                value: '+15551234567',
                customer: null,
            })
            expect(setIsOpen).toHaveBeenCalledWith(false)
        })
    })

    it('preserves agent selection when switching between tabs', async () => {
        const user = userEvent.setup()
        renderComponent()

        // Select an agent on the Agents tab
        const selectAgent = screen.getByLabelText(/select agent 1/i)
        await act(() => user.click(selectAgent))

        // Switch to External tab
        const externalTab = screen.getByRole('radio', { name: /external/i })
        await act(() => user.click(externalTab))

        expect(
            screen.getByTestId('external-transfer-content'),
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('agent-transfer-content'),
        ).not.toBeInTheDocument()

        // Switch back to Agents tab
        const agentsTab = screen.getByRole('radio', { name: /agents/i })
        await act(() => user.click(agentsTab))

        expect(screen.getByTestId('agent-transfer-content')).toBeInTheDocument()
        expect(
            screen.queryByTestId('external-transfer-content'),
        ).not.toBeInTheDocument()

        // Transfer button should be enabled because agent selection was preserved
        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })
        expect(transferButton).toBeAriaEnabled()
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

        it('does not show alert banner when transfer fails', async () => {
            const user = userEvent.setup()
            const failedTransferHandler = mockTransferCallHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'Transfer failed' } } as any,
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' },
                    },
                ),
            )
            server.use(failedTransferHandler.handler)

            renderComponent()

            const selectAgent = screen.getByLabelText(/select agent 1/i)
            await act(() => user.click(selectAgent))

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            await act(() => user.click(transferButton))

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    status: NotificationStatus.Warning,
                    message: 'Transfer failed',
                })
            })

            expect(
                screen.queryByText('Transfer unsuccessful. Please try again.'),
            ).not.toBeInTheDocument()
        })

        it('does not show toggle buttons when FF is off', () => {
            renderComponent()

            expect(
                screen.queryByRole('radio', { name: /agents/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: /external/i }),
            ).not.toBeInTheDocument()
        })

        it('shows agent transfer content by default when FF is off', () => {
            renderComponent()

            expect(
                screen.getByTestId('agent-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('external-transfer-content'),
            ).not.toBeInTheDocument()
        })
    })
})
