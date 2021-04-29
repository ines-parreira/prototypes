import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Connection} from 'twilio-client'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import {mockIncomingConnection} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import client from '../../../../../../models/api/resources'
import IncomingPhoneCall from '../IncomingPhoneCall'

jest.mock('twilio-client')

describe('<IncomingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    const integrationId = 1
    const ticketId = 2
    const mockedServer = new MockAdapter(client)
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()

        store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        name: 'My Phone Integration',
                        meta: {emoji: '❤️'},
                    },
                ],
            }),
        })
    })

    it('should render', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {container} = render(
            <Provider store={store}>
                <IncomingPhoneCall connection={connection} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should accept call', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <IncomingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('accept-call-button'))
        expect(connection.accept).toHaveBeenCalled()
    })

    it('should decline call', (done) => {
        const connection = mockIncomingConnection(
            integrationId,
            ticketId
        ) as Connection

        mockedServer.onPost('/integrations/phone/call/declined').reply(201)

        const {getByTestId} = render(
            <Provider store={store}>
                <IncomingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('decline-call-button'))
        expect(connection.ignore).toHaveBeenCalled()

        process.nextTick(() => {
            expect(mockedServer.history).toMatchSnapshot()
            done()
        })
    })
})
