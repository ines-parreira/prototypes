import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Connection} from 'twilio-client'
import {fromJS} from 'immutable'

import {mockIncomingConnection} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import OngoingPhoneCall from '../OngoingPhoneCall'

jest.mock('twilio-client')

describe('<OngoingPhoneCall/>', () => {
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
        const connection = mockIncomingConnection(integrationId) as Connection

        const {container} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should mute call', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('mute-call-button'))
        expect(connection.mute).toHaveBeenCalled()
    })

    it('should end call', () => {
        const connection = mockIncomingConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <OngoingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('end-call-button'))
        expect(connection.disconnect).toHaveBeenCalled()
    })
})
