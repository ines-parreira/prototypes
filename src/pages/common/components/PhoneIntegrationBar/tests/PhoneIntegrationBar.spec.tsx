import React from 'react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import {Call, Device} from '@twilio/voice-sdk'

import {mockIncomingCall, mockDevice, mockOutgoingCall} from 'tests/twilioMocks'
import {RootState, StoreDispatch} from 'state/types'
import {initialState} from 'state/twilio/reducers'
import client from 'models/api/resources'
import {renderWithRouter} from 'utils/testing'
import PhoneIntegrationBar from '../PhoneIntegrationBar'

jest.mock('@twilio/voice-sdk')

jest.mock('../OngoingPhoneCall/OngoingPhoneCall', () => () => (
    <div data-testid="ongoing-phone-call" />
))

jest.mock('../IncomingPhoneCall/IncomingPhoneCall', () => () => (
    <div data-testid="incoming-phone-call" />
))

jest.mock('../OutgoingPhoneCall/OutgoingPhoneCall', () => () => (
    <div data-testid="outgoing-phone-call" />
))

describe('<PhoneIntegrationBar/>', () => {
    let store: MockStoreEnhanced
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        window.location.protocol = 'https:'
        jest.resetAllMocks()
        mockedServer.reset()
    })

    it('should render ringing call bar because there is an incoming call', async () => {
        const device = mockDevice() as Device
        const call = mockIncomingCall() as Call
        store = mockStore({
            twilio: {...initialState, device, call, isRinging: true},
        })
        const {findByTestId} = renderWithRouter(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )
        expect(await findByTestId('incoming-phone-call')).toBeTruthy()
    })

    it('should render outgoing call bar because there is an outgoing call', async () => {
        const device = mockDevice() as Device
        const call = mockOutgoingCall() as Call

        store = mockStore({
            twilio: {...initialState, device, call, isDialing: true},
        })

        const {findByTestId} = renderWithRouter(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        expect(await findByTestId('outgoing-phone-call')).toBeTruthy()
    })

    it('should render ongoing call bar because there is an ongoing call', async () => {
        const device = mockDevice() as Device
        const call = mockIncomingCall() as Call

        store = mockStore({
            twilio: {...initialState, device, call, isRinging: false},
        })

        const {findByTestId} = renderWithRouter(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        expect(await findByTestId('ongoing-phone-call')).toBeTruthy()
    })
})
