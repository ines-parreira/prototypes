import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Connection} from 'twilio-client'
import {fromJS} from 'immutable'

import {mockOutgoingConnection} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import OutgoingPhoneCall from '../OutgoingPhoneCall'

jest.mock('twilio-client')

describe('<OutgoingPhoneCall/>', () => {
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
        const connection = mockOutgoingConnection(integrationId) as Connection

        const {container} = render(
            <Provider store={store}>
                <OutgoingPhoneCall connection={connection} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should end call', () => {
        const connection = mockOutgoingConnection(integrationId) as Connection

        const {getByTestId} = render(
            <Provider store={store}>
                <OutgoingPhoneCall connection={connection} />
            </Provider>
        )

        fireEvent.click(getByTestId('end-call-button'))
        expect(connection.disconnect).toHaveBeenCalled()
    })
})
