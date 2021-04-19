import React from 'react'
import {render, waitFor} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import {Connection, Device} from 'twilio-client'

import {mockConnection, mockDevice} from '../../../../../tests/twilioMocks'
import {SET_TWILIO_DEVICE} from '../../../../../state/twilio/constants'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState} from '../../../../../state/twilio/reducers'
import client from '../../../../../models/api/resources'
import PhoneIntegrationBar from '../PhoneIntegrationBar'

jest.mock('twilio-client')

describe('<PhoneIntegrationBar/>', () => {
    let store: MockStoreEnhanced
    const fakeToken = 'fake-token'
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
    })

    it('should fetch token, set device and not render anything because there is no connection', async () => {
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

    it('should render ringing call bar because there is an incoming connection', () => {
        const device = mockDevice() as Device
        const connection = mockConnection() as Connection

        store = mockStore({
            twilio: {...initialState, device, connection, isRinging: true},
        })

        const {findByTestId} = render(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        expect(findByTestId('incoming-phone-call')).toBeTruthy()
    })

    it('should render ongoing call bar because there is an ongoing connection', () => {
        const device = mockDevice() as Device
        const connection = mockConnection() as Connection

        store = mockStore({
            twilio: {...initialState, device, connection, isRinging: false},
        })

        const {findByTestId} = render(
            <Provider store={store}>
                <PhoneIntegrationBar />
            </Provider>
        )

        expect(findByTestId('ongoing-phone-call')).toBeTruthy()
    })
})
