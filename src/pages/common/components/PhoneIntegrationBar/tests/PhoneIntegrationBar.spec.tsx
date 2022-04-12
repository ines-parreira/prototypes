import React from 'react'
import {render, waitFor} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import {Call, Device} from '@twilio/voice-sdk'

import {mockIncomingCall, mockDevice, mockOutgoingCall} from 'tests/twilioMocks'
import {SET_TWILIO_DEVICE} from 'state/twilio/constants'
import {RootState, StoreDispatch} from 'state/types'
import {PreflightCheckStatus} from 'state/twilio/types'
import {initialState as defaultInitialState} from 'state/twilio/reducers'
import client from 'models/api/resources'
import PhoneIntegrationBar from '../PhoneIntegrationBar'

jest.mock('@twilio/voice-sdk')

describe('<PhoneIntegrationBar/>', () => {
    let store: MockStoreEnhanced
    const fakeToken = 'fake-token'
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const initialState = {
        ...defaultInitialState,
        preflightCheckStatus: PreflightCheckStatus.Succeeded,
    }

    beforeEach(() => {
        window.location.protocol = 'https:'
        jest.resetAllMocks()
        mockedServer.reset()
    })

    it('should fetch token, set device and not render anything because there is no call', async () => {
        store = mockStore({
            twilio: initialState,
        })

        mockedServer.onGet('/integrations/phone/token').reply(200, {
            token: fakeToken,
        })

        const {container} = render(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        await waitFor(() => {
            expect(store.getActions()).toMatchObject([
                {
                    type: SET_TWILIO_DEVICE,
                    payload: expect.any(Device),
                },
            ])
        })

        expect(container.firstChild).toBeNull()
        expect(mockedServer.history).toMatchObject({
            get: [{url: '/integrations/phone/token'}],
        })
    })

    it('should render ringing call bar because there is an incoming call', () => {
        const device = mockDevice() as Device
        const call = mockIncomingCall() as Call

        store = mockStore({
            twilio: {...initialState, device, call, isRinging: true},
        })

        const {findByTestId} = render(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        expect(findByTestId('incoming-phone-call')).toBeTruthy()
    })

    it('should render outgoing call bar because there is an outgoing call', () => {
        const device = mockDevice() as Device
        const call = mockOutgoingCall() as Call

        store = mockStore({
            twilio: {...initialState, device, call, isRinging: true},
        })

        const {findByTestId} = render(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        expect(findByTestId('outgoing-phone-call')).toBeTruthy()
    })
})
