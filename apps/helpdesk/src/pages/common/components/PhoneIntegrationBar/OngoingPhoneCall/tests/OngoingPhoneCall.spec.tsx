import { assumeMock } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Call } from '@twilio/voice-sdk'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type { Store } from 'redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { usePutCallParticipantOnHold } from '@gorgias/helpdesk-queries'

import { TwilioSocketEventType } from 'business/twilio'
import goToTicket from 'common/utils/goToTicket'
import * as twilioCallUtils from 'hooks/integrations/phone/twilioCall.utils'
import client from 'models/api/resources'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import type { TransferTarget } from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'
import { TransferType } from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'
import { useCustomSound } from 'pages/common/hooks/useCustomSound'
import socketManager from 'services/socketManager'
import type { VoiceCallTransferFailedEvent } from 'services/socketManager/types'
import { SocketEventType } from 'services/socketManager/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockIncomingCall } from 'tests/twilioMocks'

import { CallRecordingStatus, TWILIO_CURRENT_ITEM } from '../../constants'
import OngoingPhoneCall from '../OngoingPhoneCall'

jest.mock('@twilio/voice-sdk')

jest.mock('common/utils/goToTicket')
const goToTicketMock = goToTicket as jest.MockedFunction<typeof goToTicket>

jest.mock('@gorgias/helpdesk-queries')

jest.unmock('services/socketManager')
jest.unmock('services/socketManager/socketManager')

jest.mock('../CallTransferDropdown/CallTransferDropdown', () => {
    return {
        __esModule: true,
        default: ({
            isOpen,
            setIsOpen,
            onTransferInitiated,
            integrationPhoneNumberId,
        }: {
            isOpen: boolean
            setIsOpen: (flag: boolean) => void
            onTransferInitiated: (transferringTo: TransferTarget | null) => void
            integrationPhoneNumberId?: number
        }) => (
            <div
                data-testid="transfer-dropdown"
                className={isOpen ? 'is-open' : 'is-hidden'}
                onClick={() => setIsOpen(!isOpen)}
            >
                {integrationPhoneNumberId && (
                    <div data-testid="integration-phone-number-id">
                        {integrationPhoneNumberId}
                    </div>
                )}
                <div
                    data-testid="confirm-agent-transfer-button"
                    onClick={() =>
                        onTransferInitiated({ id: 1, type: TransferType.Agent })
                    }
                >
                    Transfer to Agent
                </div>
                <div
                    data-testid="confirm-external-transfer-button"
                    onClick={() =>
                        onTransferInitiated({
                            type: TransferType.External,
                            value: '+15551234567',
                            customer: null,
                        })
                    }
                >
                    Transfer to External
                </div>
            </div>
        ),
    }
})

jest.mock('../TransferTargetLabel', () => ({
    TransferTargetLabel: ({
        transferringTo,
    }: {
        transferringTo: TransferTarget
    }) => (
        <div data-testid="transfer-target-label">
            Transferring call to {transferringTo.type}
        </div>
    ),
}))

jest.mock(
    '../../QueueName/QueueName',
    () =>
        ({ queueId }: { queueId: number | null }) => (
            <div>Queue name {queueId}</div>
        ),
)

const mockUsePutCallParticipantOnHold = usePutCallParticipantOnHold as jest.Mock

jest.mock('pages/common/hooks/useCustomSound')
const useCustomSoundMock = assumeMock(useCustomSound)

describe('<OngoingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    const playSoundMock = jest.fn()

    const mockedServer = new MockAdapter(client)
    const integrationId = 1
    const otherIntegrationId = 2
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const sendTwilioSocketEvent = jest.spyOn(
        twilioCallUtils,
        'sendTwilioSocketEvent',
    )

    const integration = {
        id: integrationId,
        name: 'My Phone Integration',
        meta: {
            emoji: '❤️',
            preferences: {
                record_inbound_calls: false,
                record_outbound_calls: false,
            },
        },
    }
    const otherIntegration = {
        id: otherIntegrationId,
        name: 'My other phone integration',
        meta: {
            emoji: '❤️',
            preferences: {
                record_inbound_calls: true,
                record_outbound_calls: false,
            },
        },
    }

    beforeEach(() => {
        mockedServer.reset()

        store = mockStore({
            integrations: fromJS({
                integrations: [integration, otherIntegration],
            }),
        })

        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: jest.fn(),
        })

        useCustomSoundMock.mockReturnValue({ playSound: playSoundMock })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (store: Store, call: Call) => {
        return renderWithQueryClientProvider(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>,
        )
    }

    it('should mute and unmute call', () => {
        const call: Call = mockIncomingCall(integrationId) as Call

        renderComponent(store, call)

        fireEvent.click(screen.getByLabelText('Mute phone call'))
        expect(call.mute).toHaveBeenCalledWith(true)
        expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
            type: TwilioSocketEventType.CallMuted,
            data: {
                call_sid: 'fake-call-sid',
                id: '8fa8cf4781de72d0e14a34f0fce1b953d8d59bf41e5b7fec05de8088b54de687',
            },
        })

        fireEvent.click(screen.getByLabelText('Unmute phone call'))
        expect(call.mute).toHaveBeenCalledWith(false)
        expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
            type: TwilioSocketEventType.CallUnmuted,
            data: {
                call_sid: 'fake-call-sid',
                id: '8fa8cf4781de72d0e14a34f0fce1b953d8d59bf41e5b7fec05de8088b54de687',
            },
        })
    })

    it('should render dynamic sound wave around microphone button', () => {
        const call = mockIncomingCall(integrationId) as Call

        const { container } = renderComponent(store, call)

        const micButton = screen.getByLabelText('Mute phone call')
        expect(micButton).toBeInTheDocument()

        const soundWaveBars = container.querySelectorAll('.soundWaveBar')
        expect(soundWaveBars).toHaveLength(5)

        const soundWaveIcon = container.querySelector('.soundWaveIcon')
        expect(soundWaveIcon).toBeInTheDocument()

        const centralBar = soundWaveBars[2] as HTMLDivElement
        expect(parseInt(centralBar.style.height)).toBeGreaterThan(0)
    })

    it('should not render dynamic sound wave around microphone button on mute', () => {
        const call = mockIncomingCall(integrationId) as Call

        const { container } = renderComponent(store, call)

        const micButton = screen.getByLabelText('Mute phone call')
        expect(micButton).toBeInTheDocument()

        fireEvent.click(micButton)
        expect(call.mute).toHaveBeenCalledWith(true)

        const soundWaveBars = container.querySelectorAll('.soundWaveBar')
        const centralBar = soundWaveBars[2] as HTMLDivElement
        expect(centralBar.style.height).toBe('0px')
    })

    it('should end call', () => {
        const call = mockIncomingCall(integrationId) as Call

        renderComponent(store, call)

        fireEvent.click(screen.getByLabelText('End phone call'))
        expect(call.disconnect).toHaveBeenCalled()
    })

    it('should start recording', async () => {
        const call = mockIncomingCall(integrationId) as Call
        const url = `/api/integrations/${integrationId}/calls/fake-call-sid/recordings/${TWILIO_CURRENT_ITEM}`
        mockedServer.onPut(url).reply(200, {
            status: CallRecordingStatus.InProgress,
        })

        renderComponent(store, call)

        fireEvent.click(screen.getByLabelText('Start recording phone call'))

        await waitFor(() => {
            expect(mockedServer.history).toMatchObject({
                put: [{ url }],
            })
            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallRecordingStarted,
                data: {
                    call_sid: 'fake-call-sid',
                    id: '8fa8cf4781de72d0e14a34f0fce1b953d8d59bf41e5b7fec05de8088b54de687',
                },
            })
        })
    })

    it('should call endpoint to put call on hold', () => {
        const mockMutate = jest.fn()
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: mockMutate,
        })
        const call = mockIncomingCall(integrationId) as Call

        renderComponent(store, {
            ...call,
            parameters: {
                ...call.parameters,
                CallSid: 'fake-call-sid',
            },
        } as any)

        fireEvent.click(screen.getByLabelText('Hold phone call'))
        expect(mockMutate).toHaveBeenCalledWith({
            data: {
                hold_state: true,
                participant_call_sid: 'fake-call-sid',
            },
        })
    })

    it('should change hold state on success', async () => {
        const mockMutate = jest.fn()
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: mockMutate,
        })
        const call = mockIncomingCall(integrationId) as Call

        renderComponent(store, {
            ...call,
            parameters: {
                ...call.parameters,
                CallSid: 'fake-call-sid',
            },
        } as any)

        act(() => {
            ;(
                mockUsePutCallParticipantOnHold as jest.MockedFunction<
                    typeof usePutCallParticipantOnHold
                >
            ).mock.calls[0][0]?.mutation?.onSuccess!(
                '' as any,
                { data: { hold_state: true } } as any,
                '' as any,
            )
        })

        await waitFor(() => {
            expect(screen.getByText('pause_circle_outline')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByLabelText('Take off hold on phone call'))
        expect(mockMutate).toHaveBeenCalledWith({
            data: {
                hold_state: false,
                participant_call_sid: 'fake-call-sid',
            },
        })

        act(() => {
            ;(
                mockUsePutCallParticipantOnHold as jest.MockedFunction<
                    typeof usePutCallParticipantOnHold
                >
            ).mock.calls[0][0]?.mutation?.onSuccess!(
                '' as any,
                { data: { hold_state: false } } as any,
                '' as any,
            )
        })
        await waitFor(() => {
            expect(screen.getByText('pause')).toBeInTheDocument()
        })
    })

    it('should display error notification when hold fails', () => {
        const mockMutate = jest.fn()
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: mockMutate,
        })
        const call = mockIncomingCall(integrationId) as Call

        renderComponent(store, {
            ...call,
            parameters: {
                ...call.parameters,
                CallSid: 'fake-call-sid',
            },
        } as any)
        ;(
            mockUsePutCallParticipantOnHold as jest.MockedFunction<
                typeof usePutCallParticipantOnHold
            >
        ).mock.calls[0][0]?.mutation?.onError!('' as any, '' as any, '' as any)

        const actions = store.getActions() as {
            type: string
            payload: { message: any }
        }[]
        expect(actions[actions.length - 1].payload.message).toBe(
            'Call hold could not be completed. Please try again. ',
        )
    })

    it('should toggle transfer dropdown', () => {
        const call = mockIncomingCall(integrationId) as Call

        renderComponent(store, call)

        expect(screen.getByTestId('transfer-dropdown')).toHaveClass('is-hidden')
        fireEvent.click(screen.getByLabelText('Transfer phone call'))
        expect(screen.getByTestId('transfer-dropdown')).toHaveClass('is-open')
    })

    it.each([
        {
            buttonIdToPress: 'confirm-agent-transfer-button',
            expectedLabel: 'Transferring call to agent',
        },
        {
            buttonIdToPress: 'confirm-external-transfer-button',
            expectedLabel: 'Transferring call to external',
        },
    ])(
        `should display "Transferring" state with agent`,
        ({ buttonIdToPress, expectedLabel }) => {
            const call = mockIncomingCall(integrationId) as Call
            renderComponent(store, call)

            fireEvent.click(screen.getByTestId(buttonIdToPress))

            expect(screen.getByText('Transferring...')).toBeVisible()
            expect(
                screen.getByLabelText('Take off hold on phone call'),
            ).toBeAriaDisabled()
            expect(
                screen.getByLabelText('Transfer phone call'),
            ).toBeAriaDisabled()
            expect(screen.getByText(expectedLabel)).toBeInTheDocument()
            expect(screen.getByLabelText('End phone call')).toBeInTheDocument()
        },
    )

    it.each([
        {
            direction: 'inbound',
            recordInbound: true,
            recordOutbound: false,
            expectedIcon: 'stop_circle', // we're recording
        },
        {
            direction: 'inbound',
            recordInbound: false,
            recordOutbound: false,
            expectedIcon: 'fiber_manual_record', // we're not recording
        },
        {
            direction: 'outbound',
            recordInbound: false,
            recordOutbound: true,
            expectedIcon: 'stop_circle', // we're recording
        },
        {
            direction: 'outbound',
            recordInbound: false,
            recordOutbound: false,
            expectedIcon: 'fiber_manual_record', // we're not recording
        },
    ])(
        'should display recording correctly on transfer',
        ({ direction, recordOutbound, recordInbound, expectedIcon }) => {
            const call = mockIncomingCall(integrationId) as Call
            call.customParameters.set('call_direction', direction)

            const testIntegration = {
                ...integration,
                meta: {
                    ...integration.meta,
                    preferences: {
                        record_inbound_calls: recordInbound,
                        record_outbound_calls: recordOutbound,
                    },
                },
            }
            const testStore = mockStore({
                integrations: fromJS({
                    integrations: [testIntegration],
                }),
            })

            renderComponent(testStore, call)

            expect(screen.getByText(expectedIcon)).toBeInTheDocument()
        },
    )

    it('should display recording correctly with no routing via', () => {
        const call = mockIncomingCall(integrationId) as Call
        call.customParameters.set('integration_id', integrationId.toString())
        // @ts-ignore
        call.customParameters.set('routing_via_integration_id', null)

        renderComponent(store, call)

        // we're not recording, getting settings from integration_id
        expect(screen.getByText('fiber_manual_record')).toBeInTheDocument()
    })

    it('should display recording correctly on route to internal', () => {
        const call = mockIncomingCall(integrationId) as Call
        call.customParameters.set('integration_id', integrationId.toString())
        call.customParameters.set(
            'routing_via_integration_id',
            otherIntegrationId.toString(),
        )

        renderComponent(store, call)

        // we're recording, getting settings from otherIntegration
        expect(screen.getByText('stop_circle')).toBeInTheDocument()
    })

    it('should display notification and resume transfer buttons on transfer failure', async () => {
        const call = mockIncomingCall(integrationId) as Call

        renderComponent(store, call)

        // start the transfer
        fireEvent.click(screen.getByTestId('confirm-agent-transfer-button'))

        expect(screen.getByText('Transferring...')).toBeVisible()
        expect(
            screen.getByLabelText('Take off hold on phone call'),
        ).toBeAriaDisabled()
        expect(screen.getByLabelText('Transfer phone call')).toBeAriaDisabled()

        // send failure message from the backend
        act(() => {
            socketManager.onServerMessage({
                event: {
                    type: SocketEventType.VoiceCallTransferFailed,
                    data: {
                        error: {
                            message: 'The customer is still on the line.',
                        },
                    },
                },
            } as VoiceCallTransferFailedEvent)
        })

        const actions = store.getActions() as {
            type: string
            payload: { message: any }
        }[]
        expect(actions[actions.length - 1].payload.message).toBe(
            'The customer is still on the line.',
        )

        // the buttons should be enabled again
        await waitFor(() => {
            expect(screen.getByText('Connected')).toBeVisible()
            expect(screen.getByLabelText('Hold phone call')).toBeAriaEnabled()
            expect(
                screen.getByLabelText('Transfer phone call'),
            ).toBeAriaEnabled()
        })
    })

    it('passes integrationPhoneNumberId from integration meta to CallTransferDropdown', () => {
        const call = mockIncomingCall(integrationId) as Call

        const integrationWithPhoneNumber = {
            ...integration,
            meta: {
                ...integration.meta,
                phone_number_id: 456,
            },
        }

        const testStore = mockStore({
            integrations: fromJS({
                integrations: [integrationWithPhoneNumber],
            }),
        })

        renderComponent(testStore, call)

        fireEvent.click(screen.getByLabelText('Transfer phone call'))

        expect(
            screen.getByTestId('integration-phone-number-id'),
        ).toHaveTextContent('456')
    })

    it('should display queue name', () => {
        const call = mockIncomingCall(integrationId) as Call
        call.customParameters.set('queue_id', '1234')

        renderComponent(store, call)

        expect(screen.getByText('Queue name 1234')).toBeInTheDocument()
    })

    it('should navigate to ticket when clicking customer name button', async () => {
        const user = userEvent.setup()
        const ticketId = 456
        const call = mockIncomingCall(integrationId) as Call
        call.customParameters.set('ticket_id', ticketId.toString())

        renderComponent(store, call)

        const customerNameButton = screen.getByRole('button', {
            name: /Bob/i,
        })
        await user.click(customerNameButton)

        expect(goToTicketMock).toHaveBeenCalledWith(ticketId)
    })

    describe('Whispering warning', () => {
        it('should show icon warning only when whispering starts', async () => {
            const call = mockIncomingCall(integrationId) as Call

            renderComponent(store, call)

            // whispering starts
            await act(() =>
                call.emit('messageReceived', {
                    content: {
                        type: TwilioMessageType.MonitoringUpdate,
                        data: {
                            monitored_agent_id: 123,
                            monitoring_status: 'whispering',
                        },
                    },
                }),
            )

            expect(
                await screen.findByRole('img', {
                    name: 'headset',
                }),
            ).toBeInTheDocument()
            expect(playSoundMock).toHaveBeenCalledWith()

            playSoundMock.mockReset()
            // whispering ends
            await act(() =>
                call.emit('messageReceived', {
                    content: {
                        type: TwilioMessageType.MonitoringUpdate,
                        data: {
                            monitored_agent_id: 123,
                            monitoring_status: 'listening',
                        },
                    },
                }),
            )

            expect(
                await screen.queryByRole('img', {
                    name: 'headset',
                }),
            ).not.toBeInTheDocument()
            expect(playSoundMock).toHaveBeenCalled()
        })
    })
})
