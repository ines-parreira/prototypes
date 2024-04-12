import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Call} from '@twilio/voice-sdk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {TwilioSocketEventType} from 'business/twilio'

import * as utils from 'hooks/integrations/phone/utils'

import {FeatureFlagKey} from 'config/featureFlags'
import {SET_TWILIO_IS_RECORDING} from 'state/twilio/constants'
import {mockIncomingCall} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import client from '../../../../../../models/api/resources'
import OngoingPhoneCall from '../OngoingPhoneCall'
import {CallRecordingStatus, TWILIO_CURRENT_ITEM} from '../../constants'

jest.mock('@twilio/voice-sdk')

jest.mock('../CallTransferDropdown', () => ({
    __esModule: true,
    default: ({
        isOpen,
        setIsOpen,
        onTransferInitiated,
    }: {
        isOpen: boolean
        setIsOpen: (flag: boolean) => void
        onTransferInitiated: () => void
    }) => (
        <div
            data-testid="transfer-dropdown"
            className={isOpen ? 'is-open' : 'is-hidden'}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div
                data-testid="confirm-transfer-button"
                onClick={onTransferInitiated}
            >
                Transfer
            </div>
        </div>
    ),
}))

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
                record_inbound_calls: true,
                record_outbound_calls: true,
            },
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        resetLDMocks()
        mockFlags({})
        mockedServer.reset()

        store = mockStore({
            twilio: {
                device: null,
                call: null,
                isDialing: false,
                isRinging: false,
                isRecording: false,
                isConnecting: false,
                warning: null,
                error: null,
                reconnectAttempts: 0,
            },
            integrations: fromJS({
                integrations: [integration],
            }),
        })
    })

    it('should mute call', () => {
        const call: Call = mockIncomingCall(integrationId) as Call

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        fireEvent.click(getByTestId('mute-call-button'))
        expect(call.mute).toHaveBeenCalledWith(true)
        expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
            type: TwilioSocketEventType.CallMuted,
            data: {
                call_sid: 'fake-call-sid',
                id: '8fa8cf4781de72d0e14a34f0fce1b953d8d59bf41e5b7fec05de8088b54de687',
            },
        })

        fireEvent.click(getByTestId('mute-call-button'))
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
        const call = mockIncomingCall(integrationId) as Call

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        fireEvent.click(getByTestId('end-call-button'))
        expect(call.disconnect).toHaveBeenCalled()

        const actions = store.getActions() as {
            type: string
            payload: {message: any}
        }[]
        const lastAction = actions[actions.length - 1]
        expect(lastAction.type).toBe(SET_TWILIO_IS_RECORDING)
        expect(lastAction.payload).toBe(false)
    })

    it('should start recording', async () => {
        const call = mockIncomingCall(integrationId) as Call

        const url = `/api/integrations/${integrationId}/calls/fake-call-sid/recordings/${TWILIO_CURRENT_ITEM}`

        mockedServer.onPut(url).reply(200, {
            status: CallRecordingStatus.InProgress,
        })

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        fireEvent.click(getByTestId('record-call-button'))

        await waitFor(() => {
            expect(mockedServer.history).toMatchObject({
                put: [{url}],
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

    it('should display hold button', () => {
        const call = mockIncomingCall(integrationId) as Call
        mockFlags({[FeatureFlagKey.CallOnHold]: true})

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        expect(getByTestId('hold-call-button')).toBeInTheDocument()
    })

    it('should not display hold button when FF is disabled', () => {
        const call = mockIncomingCall(integrationId) as Call

        const {queryByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        expect(queryByTestId('hold-call-button')).toBeNull()
    })

    it('should display transfer button', () => {
        const call = mockIncomingCall(integrationId) as Call
        mockFlags({[FeatureFlagKey.CallTransfer]: true})

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        expect(getByTestId('transfer-call-button')).toBeInTheDocument()
    })

    it('should not display transfer button when FF is disabled', () => {
        const call = mockIncomingCall(integrationId) as Call

        const {queryByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        expect(queryByTestId('transfer-call-button')).toBeNull()
    })

    it('should toggle transfer dropdown', () => {
        const call = mockIncomingCall(integrationId) as Call
        mockFlags({[FeatureFlagKey.CallTransfer]: true})

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        expect(getByTestId('transfer-dropdown')).toHaveClass('is-hidden')
        fireEvent.click(getByTestId('transfer-call-button'))
        expect(getByTestId('transfer-dropdown')).toHaveClass('is-open')
    })

    it(`should display "Transferring" state after a transfer is initiated`, () => {
        const call = mockIncomingCall(integrationId) as Call
        mockFlags({[FeatureFlagKey.CallTransfer]: true})

        const {getByTestId, getByText} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        fireEvent.click(getByTestId('confirm-transfer-button'))
        expect(getByText('Transferring...')).toBeVisible()
    })
})
