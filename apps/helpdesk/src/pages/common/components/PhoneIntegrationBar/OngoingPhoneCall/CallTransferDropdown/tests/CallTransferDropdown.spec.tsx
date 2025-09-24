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
        default: ({
            phoneNumber,
            customer,
            setSelectedExternalPhoneNumber,
            onPhoneNumberValidationChange,
            integrationPhoneNumberId,
        }: any) => {
            return (
                <div data-testid="external-transfer-content">
                    {integrationPhoneNumberId && (
                        <div data-testid="integration-phone-number-id">
                            {integrationPhoneNumberId}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setSelectedExternalPhoneNumber('+15551234567', null)
                            onPhoneNumberValidationChange?.(true)
                        }}
                        aria-label="Set external number"
                    >
                        Set External
                    </button>
                    <button
                        onClick={() => {
                            setSelectedExternalPhoneNumber('', null)
                            onPhoneNumberValidationChange?.(false)
                        }}
                        aria-label="Clear external number"
                    >
                        Clear External
                    </button>
                    <button
                        onClick={() => onPhoneNumberValidationChange?.(true)}
                        aria-label="Mark phone valid"
                    >
                        Mark Valid
                    </button>
                    <button
                        onClick={() => onPhoneNumberValidationChange?.(false)}
                        aria-label="Mark phone invalid"
                    >
                        Mark Invalid
                    </button>
                    <button
                        onClick={() => {
                            setSelectedExternalPhoneNumber('+15559876543', {
                                customer: {
                                    id: 456,
                                    name: 'Guybrush Threepwood',
                                },
                            })
                            onPhoneNumberValidationChange?.(true)
                        }}
                        aria-label="Set external with customer"
                    >
                        Set External With Customer
                    </button>
                    {phoneNumber && (
                        <div data-testid="current-phone-number">
                            {phoneNumber}
                        </div>
                    )}
                    {customer && (
                        <div data-testid="current-customer-name">
                            {customer.customer?.name}
                        </div>
                    )}
                </div>
            )
        },
    }),
)

jest.mock(
    'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/QueueCallTransferDropdownContent',
    () => ({
        __esModule: true,
        default: ({ setSelectedQueueId, clearErrors }: any) => {
            return (
                <div data-testid="queue-transfer-content">
                    <button
                        onClick={() => setSelectedQueueId(1)}
                        aria-label="Select Queue 1"
                    >
                        Queue 1
                    </button>
                    <button
                        onClick={() => clearErrors()}
                        aria-label="Clear queue errors"
                    >
                        Clear
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
            if (flag === FeatureFlagKey.TransferCallToQueue) {
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

    it('renders toggle button with Agents, Queues and External options', () => {
        renderComponent()

        expect(
            screen.getByRole('radio', { name: /agents/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /queues/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /external/i }),
        ).toBeInTheDocument()
    })

    it('only enables the transfer button when a target is selected, if not transferring to external number', async () => {
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

    it('only enables transfer button when external phone number is valid, if transferring to external number', async () => {
        const user = userEvent.setup()
        renderComponent()

        const externalTab = screen.getByRole('radio', { name: /external/i })
        await act(() => user.click(externalTab))

        const transferButton = screen.getByRole('button', {
            name: /transfer call/i,
        })

        expect(transferButton).toBeAriaDisabled()

        const markValid = screen.getByLabelText(/mark phone valid/i)
        await act(() => user.click(markValid))
        expect(transferButton).toBeAriaDisabled()

        const setExternal = screen.getByLabelText(/set external number/i)
        await act(() => user.click(setExternal))
        expect(transferButton).toBeAriaEnabled()

        const markInvalid = screen.getByLabelText(/mark phone invalid/i)
        await act(() => user.click(markInvalid))
        expect(transferButton).toBeAriaDisabled()
    })

    describe('transfer to agent', () => {
        it('transfers call to selected agent', async () => {
            const user = userEvent.setup()
            const waitForTransferRequest =
                mockTransferCall.waitForRequest(server)
            renderComponent()

            const selectAgent = screen.getByLabelText(/select agent 1/i)
            await act(() => user.click(selectAgent))

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            await act(() => user.click(transferButton))

            await waitForTransferRequest(async (request) => {
                const body = await request.json()
                expect(body.receiver_type).toBe(
                    VoiceCallTransferReceiverType.Agent,
                )
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
                expect(
                    screen.getByText(
                        'Transfer unsuccessful. Please try again.',
                    ),
                ).toBeInTheDocument()
            })

            const clearButton = screen.getByLabelText(/clear errors/i)
            await act(() => user.click(clearButton))

            expect(
                screen.queryByText('Transfer unsuccessful. Please try again.'),
            ).not.toBeInTheDocument()
        })

        it('preserves agent selection when switching between tabs', async () => {
            const user = userEvent.setup()
            renderComponent()

            const selectAgent = screen.getByLabelText(/select agent 1/i)
            await act(() => user.click(selectAgent))

            let transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaEnabled()

            const externalTab = screen.getByRole('radio', { name: /external/i })
            await act(() => user.click(externalTab))

            expect(
                screen.getByTestId('external-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('agent-transfer-content'),
            ).not.toBeInTheDocument()

            transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaDisabled()

            const agentsTab = screen.getByRole('radio', { name: /agents/i })
            await act(() => user.click(agentsTab))

            expect(
                screen.getByTestId('agent-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('external-transfer-content'),
            ).not.toBeInTheDocument()

            transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaEnabled()

            const waitForTransferRequest =
                mockTransferCall.waitForRequest(server)
            await act(() => user.click(transferButton))

            await waitForTransferRequest(async (request) => {
                const body = await request.json()
                expect(body.receiver_type).toBe(
                    VoiceCallTransferReceiverType.Agent,
                )
                expect(body.receiver_id).toBe(1)
            })
        })
    })

    describe('transfer to external number', () => {
        it('shows external transfer content when External tab is selected', async () => {
            const user = userEvent.setup()
            renderComponent({ ...baseProps, integrationPhoneNumberId: 123 })

            const externalTab = screen.getByRole('radio', { name: /external/i })
            await act(() => user.click(externalTab))

            expect(
                screen.getByTestId('external-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('agent-transfer-content'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByTestId('integration-phone-number-id'),
            ).toHaveTextContent('123')
        })

        it('transfers call to external number', async () => {
            const user = userEvent.setup()
            const waitForTransferRequest =
                mockTransferCall.waitForRequest(server)
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

        it('clears alert banner when phone number validation changes', async () => {
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

            const externalTab = screen.getByRole('radio', { name: /external/i })
            await act(() => user.click(externalTab))

            const setExternal = screen.getByLabelText(/set external number/i)
            await act(() => user.click(setExternal))

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            await act(() => user.click(transferButton))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Transfer unsuccessful. Please try again.',
                    ),
                ).toBeInTheDocument()
            })

            const markInvalid = screen.getByLabelText(/mark phone invalid/i)
            await act(() => user.click(markInvalid))

            expect(
                screen.queryByText('Transfer unsuccessful. Please try again.'),
            ).not.toBeInTheDocument()
        })

        it('preserves external customer and phone number when switching between tabs', async () => {
            const user = userEvent.setup()
            renderComponent()

            const externalTab = screen.getByRole('radio', { name: /external/i })
            await act(() => user.click(externalTab))

            const setExternalWithCustomer = screen.getByLabelText(
                /set external with customer/i,
            )
            await act(() => user.click(setExternalWithCustomer))

            expect(
                screen.getByTestId('current-phone-number'),
            ).toHaveTextContent('+15559876543')
            expect(
                screen.getByTestId('current-customer-name'),
            ).toHaveTextContent('Guybrush Threepwood')

            let transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaEnabled()

            const queuesTab = screen.getByRole('radio', { name: /queues/i })
            await act(() => user.click(queuesTab))

            expect(
                screen.getByTestId('queue-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('external-transfer-content'),
            ).not.toBeInTheDocument()

            transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaDisabled()

            const externalTabAgain = screen.getByRole('radio', {
                name: /external/i,
            })
            await act(() => user.click(externalTabAgain))

            expect(
                screen.getByTestId('external-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('queue-transfer-content'),
            ).not.toBeInTheDocument()

            expect(
                screen.getByTestId('current-phone-number'),
            ).toHaveTextContent('+15559876543')
            expect(
                screen.getByTestId('current-customer-name'),
            ).toHaveTextContent('Guybrush Threepwood')

            transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaEnabled()

            const waitForTransferRequest =
                mockTransferCall.waitForRequest(server)
            await act(() => user.click(transferButton))

            await waitForTransferRequest(async (request) => {
                const body = await request.json()
                expect(body.receiver_type).toBe(
                    VoiceCallTransferReceiverType.External,
                )
                expect(body.receiver_value).toBe('+15559876543')
            })
        })
    })

    describe('transfer to queue', () => {
        it('shows queue transfer content when Queues tab is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const queuesTab = screen.getByRole('radio', { name: /queues/i })
            await act(() => user.click(queuesTab))

            expect(
                screen.getByTestId('queue-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('agent-transfer-content'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('external-transfer-content'),
            ).not.toBeInTheDocument()
        })

        it('only enables transfer button when a queue is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const queuesTab = screen.getByRole('radio', { name: /queues/i })
            await act(() => user.click(queuesTab))

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })

            expect(transferButton).toBeAriaDisabled()

            const selectQueue = screen.getByLabelText(/select queue 1/i)
            await act(() => user.click(selectQueue))
            expect(transferButton).toBeAriaEnabled()
        })

        it('transfers call to selected queue', async () => {
            const user = userEvent.setup()
            const waitForTransferRequest =
                mockTransferCall.waitForRequest(server)
            renderComponent()

            const queuesTab = screen.getByRole('radio', { name: /queues/i })
            await act(() => user.click(queuesTab))

            const selectQueue = screen.getByLabelText(/select queue 1/i)
            await act(() => user.click(selectQueue))

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            await act(() => user.click(transferButton))

            await waitForTransferRequest(async (request) => {
                const body = await request.json()
                expect(body.receiver_type).toBe('queue')
                expect(body.receiver_id).toBe(1)
            })

            await waitFor(() => {
                expect(onTransferInitiated).toHaveBeenCalledWith({
                    type: TransferType.Queue,
                    id: 1,
                })
                expect(setIsOpen).toHaveBeenCalledWith(false)
            })
        })

        it('clears alert banner when queue clear errors is called', async () => {
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

            const queuesTab = screen.getByRole('radio', { name: /queues/i })
            await act(() => user.click(queuesTab))

            const selectQueue = screen.getByLabelText(/select queue 1/i)
            await act(() => user.click(selectQueue))

            const transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            await act(() => user.click(transferButton))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Transfer unsuccessful. Please try again.',
                    ),
                ).toBeInTheDocument()
            })

            const clearButton = screen.getByLabelText(/clear queue errors/i)
            await act(() => user.click(clearButton))

            expect(
                screen.queryByText('Transfer unsuccessful. Please try again.'),
            ).not.toBeInTheDocument()
        })

        it('preserves queue selection when switching between tabs', async () => {
            const user = userEvent.setup()
            renderComponent()

            const queuesTab = screen.getByRole('radio', { name: /queues/i })
            await act(() => user.click(queuesTab))

            const selectQueue = screen.getByLabelText(/select queue 1/i)
            await act(() => user.click(selectQueue))

            let transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaEnabled()

            const externalTab = screen.getByRole('radio', { name: /external/i })
            await act(() => user.click(externalTab))

            expect(
                screen.getByTestId('external-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('queue-transfer-content'),
            ).not.toBeInTheDocument()

            transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaDisabled()

            const queuesTabAgain = screen.getByRole('radio', {
                name: /queues/i,
            })
            await act(() => user.click(queuesTabAgain))

            expect(
                screen.getByTestId('queue-transfer-content'),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('external-transfer-content'),
            ).not.toBeInTheDocument()

            transferButton = screen.getByRole('button', {
                name: /transfer call/i,
            })
            expect(transferButton).toBeAriaEnabled()

            const waitForTransferRequest =
                mockTransferCall.waitForRequest(server)
            await act(() => user.click(transferButton))

            await waitForTransferRequest(async (request) => {
                const body = await request.json()
                expect(body.receiver_type).toBe('queue')
                expect(body.receiver_id).toBe(1)
            })
        })
    })

    describe('transfer to queue FF disabled', () => {
        beforeEach(() => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                    return true
                }
                if (flag === FeatureFlagKey.TransferCallToQueue) {
                    return false
                }
                return false
            })
        })

        it('does not show Queues toggle button when TransferCallToQueue feature flag is disabled', () => {
            renderComponent()

            expect(
                screen.getByRole('radio', { name: /agents/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: /queues/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: /external/i }),
            ).toBeInTheDocument()
        })
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
