import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Call} from '@twilio/voice-sdk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {TwilioSocketEventType} from 'business/twilio'

import * as utils from 'hooks/integrations/phone/utils'

import {mockIncomingCall} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import client from '../../../../../../models/api/resources'
import OngoingPhoneCall from '../OngoingPhoneCall'
import {CallRecordingStatus, TWILIO_CURRENT_ITEM} from '../../constants'

jest.mock('@twilio/voice-sdk')

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

    it('should render', () => {
        const call = mockIncomingCall(integrationId) as Call

        const {container} = render(
            <Provider store={store}>
                <OngoingPhoneCall call={call} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
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
})
