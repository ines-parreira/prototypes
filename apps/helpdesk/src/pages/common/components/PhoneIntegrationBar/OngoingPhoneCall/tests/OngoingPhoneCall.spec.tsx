import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Call } from '@twilio/voice-sdk'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { usePutCallParticipantOnHold } from '@gorgias/helpdesk-queries'

import { TwilioSocketEventType } from 'business/twilio'
import * as utils from 'hooks/integrations/phone/utils'
import client from 'models/api/resources'
import {
    TransferTarget,
    TransferType,
} from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'
import socketManager from 'services/socketManager'
import {
    SocketEventType,
    VoiceCallTransferFailedEvent,
} from 'services/socketManager/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockIncomingCall } from 'tests/twilioMocks'

import { CallRecordingStatus, TWILIO_CURRENT_ITEM } from '../../constants'
import OngoingPhoneCall from '../OngoingPhoneCall'

jest.mock('@twilio/voice-sdk')

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
        }: {
            isOpen: boolean
            setIsOpen: (flag: boolean) => void
            onTransferInitiated: (transferringTo: TransferTarget | null) => void
        }) => (
            <div
                data-testid="transfer-dropdown"
                className={isOpen ? 'is-open' : 'is-hidden'}
                onClick={() => setIsOpen(!isOpen)}
            >
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

const mockUsePutCallParticipantOnHold = usePutCallParticipantOnHold as jest.Mock

describe('<OngoingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    const mockedServer = new MockAdapter(client)
    const integrationId = 1
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const sendTwilioSocketEvent = jest.spyOn(utils, 'sendTwilioSocketEvent')

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

    beforeEach(() => {
        mockedServer.reset()

        store = mockStore({
            integrations: fromJS({
                integrations: [integration],
            }),
        })
    })

    it('should mute and unmute call', () => {
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: jest.fn(),
        })
        const call: Call = mockIncomingCall(integrationId) as Call

        render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>,
        )

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

    it('should end call', () => {
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: jest.fn(),
        })
        const call = mockIncomingCall(integrationId) as Call

        render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>,
        )

        fireEvent.click(screen.getByLabelText('End phone call'))
        expect(call.disconnect).toHaveBeenCalled()
    })

    it('should start recording', async () => {
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: jest.fn(),
        })
        const call = mockIncomingCall(integrationId) as Call
        const url = `/api/integrations/${integrationId}/calls/fake-call-sid/recordings/${TWILIO_CURRENT_ITEM}`
        mockedServer.onPut(url).reply(200, {
            status: CallRecordingStatus.InProgress,
        })
        render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>,
        )

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

        render(
            <Provider store={store}>
                <OngoingPhoneCall
                    call={
                        {
                            ...call,
                            parameters: {
                                ...call.parameters,
                                CallSid: 'fake-call-sid',
                            },
                        } as any
                    }
                />
            </Provider>,
        )

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

        render(
            <Provider store={store}>
                <OngoingPhoneCall
                    call={
                        {
                            ...call,
                            parameters: {
                                ...call.parameters,
                                CallSid: 'fake-call-sid',
                            },
                        } as any
                    }
                />
            </Provider>,
        )
        ;(
            mockUsePutCallParticipantOnHold as jest.MockedFunction<
                typeof usePutCallParticipantOnHold
            >
        ).mock.calls[0][0]?.mutation?.onSuccess!(
            '' as any,
            { data: { hold_state: true } } as any,
            '' as any,
        )
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
        ;(
            mockUsePutCallParticipantOnHold as jest.MockedFunction<
                typeof usePutCallParticipantOnHold
            >
        ).mock.calls[0][0]?.mutation?.onSuccess!(
            '' as any,
            { data: { hold_state: false } } as any,
            '' as any,
        )
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

        render(
            <Provider store={store}>
                <OngoingPhoneCall
                    call={
                        {
                            ...call,
                            parameters: {
                                ...call.parameters,
                                CallSid: 'fake-call-sid',
                            },
                        } as any
                    }
                />
            </Provider>,
        )
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
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: jest.fn(),
        })
        const call = mockIncomingCall(integrationId) as Call

        render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>,
        )

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
            mockUsePutCallParticipantOnHold.mockReturnValue({
                mutate: jest.fn(),
            })
            const call = mockIncomingCall(integrationId) as Call
            render(
                <Provider store={store}>
                    <OngoingPhoneCall call={call} />
                </Provider>,
            )

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
            const mockMutate = jest.fn()
            mockUsePutCallParticipantOnHold.mockReturnValue({
                mutate: mockMutate,
            })
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

            render(
                <Provider store={testStore}>
                    <OngoingPhoneCall call={call} />
                </Provider>,
            )

            expect(screen.getByText(expectedIcon)).toBeInTheDocument()
        },
    )

    it('should display notification and resume transfer buttons on transfer failure', async () => {
        mockUsePutCallParticipantOnHold.mockReturnValue({
            mutate: jest.fn(),
        })
        const call = mockIncomingCall(integrationId) as Call

        render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>,
        )

        // start the transfer
        fireEvent.click(screen.getByTestId('confirm-agent-transfer-button'))

        expect(screen.getByText('Transferring...')).toBeVisible()
        expect(
            screen.getByLabelText('Take off hold on phone call'),
        ).toBeAriaDisabled()
        expect(screen.getByLabelText('Transfer phone call')).toBeAriaDisabled()

        // send failure message from the backend
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
})
