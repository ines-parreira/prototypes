import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import user, { userEvent } from '@testing-library/user-event'
import type { Call } from '@twilio/voice-sdk'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockHandleCallWhisperingHandler } from '@gorgias/helpdesk-mocks'

import { useNotify } from 'hooks/useNotify'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { mockMonitoringCall } from 'tests/twilioMocks'

import MonitoringPhoneCall from '../MonitoringPhoneCall'

jest.mock('@twilio/voice-sdk')
jest.mock('hooks/useNotify')

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () => ({
        __esModule: true,
        default: ({
            customerId,
            phoneNumber,
        }: {
            customerId: number
            phoneNumber: string
        }) => (
            <span data-testid="customer-label">
                Customer {customerId} ({phoneNumber})
            </span>
        ),
    }),
)

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () => ({
        __esModule: true,
        default: ({ agentId }: { agentId: number }) => (
            <span data-testid="agent-label">Agent {agentId}</span>
        ),
    }),
)

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)
const useNotifyMock = assumeMock(useNotify)

const server = setupServer()

const mockHandleCallWhispering = mockHandleCallWhisperingHandler()
const localHandlers = [mockHandleCallWhispering.handler]

describe('MonitoringPhoneCall', () => {
    const integrationId = 1
    const inCallAgentId = 123
    const customerId = 456
    const customerPhoneNumber = '+14158880101'

    const integration = {
        id: integrationId,
        name: 'My Phone Integration',
        meta: {
            emoji: '❤️',
        },
    }

    const mockNotifyError = jest.fn()

    const store = {
        integrations: fromJS({
            integrations: [integration],
        }),
    }
    const renderComponent = (call: Call) => {
        return renderWithStoreAndQueryClientProvider(
            <MonitoringPhoneCall call={call} />,
            store,
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        useNotifyMock.mockReturnValue({
            error: mockNotifyError,
        } as any)
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.CallWhispering) return true
            return false
        })
        server.use(...localHandlers)
    })

    afterEach(() => {
        jest.clearAllMocks()
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render stop listening button', () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderComponent(call)

        expect(
            screen.getByRole('button', { name: /Stop Listening/i }),
        ).toBeInTheDocument()
    })

    it('should disconnect call when stop listening button is clicked', async () => {
        const userEvent = user.setup()
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderComponent(call)

        await act(() =>
            userEvent.click(
                screen.getByRole('button', { name: /Stop Listening/i }),
            ),
        )

        expect(call.disconnect).toHaveBeenCalled()
    })

    it('should display integration, customer and agent information', () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderComponent(call)

        expect(screen.getByText('My Phone Integration')).toBeInTheDocument()
        expect(screen.getByTestId('customer-label')).toHaveTextContent(
            `Customer ${customerId} (${customerPhoneNumber})`,
        )
        expect(screen.getByTestId('agent-label')).toHaveTextContent(
            `Agent ${inCallAgentId}`,
        )
    })

    it('should display connected status', () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderComponent(call)

        expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('should handle custom parameters missing', () => {
        const call = {
            customParameters: new Map([
                ['integration_id', 'null'],
                ['in_call_agent_id', 'null'],
                ['customer_id', 'null'],
                ['customer_phone_number', customerPhoneNumber],
            ]),
            parameters: { CallSid: 'CA123' },
            on: jest.fn(),
            off: jest.fn(),
        } as unknown as Call

        renderComponent(call)

        expect(
            screen.queryByText('My Phone Integration'),
        ).not.toBeInTheDocument()
        expect(screen.queryByTestId('customer-label')).not.toBeInTheDocument()
        expect(screen.queryByTestId('agent-label')).not.toBeInTheDocument()
        expect(screen.getByText(customerPhoneNumber)).toBeInTheDocument()
        expect(screen.getByText('unknown agent')).toBeInTheDocument()
    })

    it('should update agent label when InCallAgentChanged message is received', async () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderComponent(call)

        expect(screen.getByTestId('agent-label')).toHaveTextContent(
            `Agent ${inCallAgentId}`,
        )

        const newAgentId = 999

        await act(() =>
            call.emit('messageReceived', {
                content: {
                    type: TwilioMessageType.InCallAgentChanged,
                    data: { agent_id: newAgentId.toString() },
                },
            }),
        )

        expect(screen.getByTestId('agent-label')).toHaveTextContent(
            `Agent ${newAgentId}`,
        )
    })

    describe('Whispering', () => {
        it('should start whispering when button is clicked', async () => {
            const user = userEvent.setup()

            const call = mockMonitoringCall(
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
                'CA1234567890',
            ) as Call

            const waitForStartWhisperingRequest =
                mockHandleCallWhispering.waitForRequest(server)

            const { container } = renderComponent(call)

            const startWhisperingButton = await screen.findByRole('img', {
                name: 'user-voice',
            })
            await act(() => user.click(startWhisperingButton))

            await waitForStartWhisperingRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    monitoring_call_sid: 'CA1234567890',
                    whisper: true,
                })
            })

            const stopWhisperingButton = await screen.findByRole('img', {
                name: 'user-mute',
            })
            expect(stopWhisperingButton).toBeInTheDocument()

            // check that we have the soundwave icon and it reacts to call volume changes
            const soundWaveIcon = container.querySelector('.soundWaveIcon')
            expect(soundWaveIcon).toBeInTheDocument()

            await act(() => call.emit('volume', 0.8))

            const soundWaveBars = container.querySelectorAll('.soundWaveBar')
            expect(soundWaveBars).toHaveLength(5)

            const barHeights = Array.from(soundWaveBars).map(
                (bar) => parseInt((bar as HTMLElement).style.height) || 0,
            )

            // center bar (index 2) reacts immediately to volume changes
            expect(barHeights[2]).toBeGreaterThan(0)
        })

        it('should stop whispering when button is clicked', async () => {
            const user = userEvent.setup()

            const call = mockMonitoringCall(
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
                'CA1234567890',
            ) as Call

            const { container } = renderComponent(call)

            const startWhisperingButton = await screen.findByRole('img', {
                name: 'user-voice',
            })
            await act(() => user.click(startWhisperingButton))

            const stopWhisperingButton = await screen.findByRole('img', {
                name: 'user-mute',
            })
            expect(stopWhisperingButton).toBeInTheDocument()

            const waitForStartWhisperingRequest =
                mockHandleCallWhispering.waitForRequest(server)

            await act(() => user.click(stopWhisperingButton))

            await waitForStartWhisperingRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    monitoring_call_sid: 'CA1234567890',
                    whisper: false,
                })
            })

            // check that we have the soundwave icon and it does NOT react to call volume changes
            const soundWaveIcon = container.querySelector('.soundWaveIcon')
            expect(soundWaveIcon).toBeInTheDocument()

            await act(() => call.emit('volume', 0.8))

            const soundWaveBars = container.querySelectorAll('.soundWaveBar')
            expect(soundWaveBars).toHaveLength(5)

            const barHeights = Array.from(soundWaveBars).map(
                (bar) => parseInt((bar as HTMLElement).style.height) || 0,
            )

            // center bar (index 2) reacts immediately to volume changes
            expect(barHeights[2]).toBe(0)
        })

        it('should show error notification when start whispering request fails', async () => {
            const user = userEvent.setup()

            const { handler } = mockHandleCallWhisperingHandler(async () =>
                HttpResponse.json(null, { status: 500 }),
            )
            server.use(handler)

            const call = mockMonitoringCall(
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
                'CA1234567890',
            ) as Call

            renderComponent(call)

            const startWhisperingButton = await screen.findByRole('img', {
                name: 'user-voice',
            })
            await act(() => user.click(startWhisperingButton))

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'Failed to start whispering. Please try again.',
                )
            })

            // button should remain as "start whispering" since request failed
            const stillStartWhisperingButton = await screen.findByRole('img', {
                name: 'user-voice',
            })
            expect(stillStartWhisperingButton).toBeInTheDocument()
        })

        it('should show error notification when stop whispering request fails', async () => {
            const user = userEvent.setup()

            const call = mockMonitoringCall(
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
                'CA1234567890',
            ) as Call

            renderComponent(call)

            const startWhisperingButton = await screen.findByRole('img', {
                name: 'user-voice',
            })
            await act(() => user.click(startWhisperingButton))

            const stopWhisperingButton = await screen.findByRole('img', {
                name: 'user-mute',
            })
            expect(stopWhisperingButton).toBeInTheDocument()

            const { handler } = mockHandleCallWhisperingHandler(async () =>
                HttpResponse.json(null, { status: 500 }),
            )
            server.use(handler)

            await act(() => user.click(stopWhisperingButton))

            await waitFor(() => {
                expect(mockNotifyError).toHaveBeenCalledWith(
                    'Failed to stop whispering. Please try again.',
                )
            })

            // button should remain as "stop whispering" since request failed
            const stillStopWhisperingButton = await screen.findByRole('img', {
                name: 'user-mute',
            })
            expect(stillStopWhisperingButton).toBeInTheDocument()
        })

        it('should hide whispering button when FF is off', async () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.CallWhispering) return false
                return false
            })

            const call = mockMonitoringCall(
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
                'CA1234567890',
            ) as Call

            renderComponent(call)

            const startWhisperingButton = await screen.queryByRole('img', {
                name: 'user-voice',
            })
            expect(startWhisperingButton).not.toBeInTheDocument()
            const stopWhisperingButton = await screen.queryByRole('img', {
                name: 'user-mute',
            })
            expect(stopWhisperingButton).not.toBeInTheDocument()
        })
    })
})
