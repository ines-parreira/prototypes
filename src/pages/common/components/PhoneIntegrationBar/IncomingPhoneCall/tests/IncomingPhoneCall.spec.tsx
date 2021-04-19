import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Connection} from 'twilio-client'
import {fromJS} from 'immutable'

import {mockConnection} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import IncomingPhoneCall from '../IncomingPhoneCall'

jest.mock('twilio-client')

describe('<IncomingPhoneCall/>', () => {
    let store: MockStoreEnhanced
    const integrationId = 1
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()

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
        const connection = mockConnection(integrationId) as Connection

        const {container} = render(
            <Provider store={store}>
                <IncomingPhoneCall connection={connection} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should accept call', () => {
        const connection = mockConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <IncomingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('accept-call-button'))
        expect(connection.accept).toHaveBeenCalled()
    })

    it('should decline call', () => {
        const connection = mockConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <IncomingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('decline-call-button'))
        expect(connection.ignore).toHaveBeenCalled()
    })
})
