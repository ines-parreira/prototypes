import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Call} from '@twilio/voice-sdk'
import {fromJS} from 'immutable'

import {mockOutgoingCall} from '../../../../../../tests/twilioMocks'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import OutgoingPhoneCall from '../OutgoingPhoneCall'

jest.mock('@twilio/voice-sdk')

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
        const call = mockOutgoingCall(integrationId) as Call

        const {container} = render(
            <Provider store={store}>
                <OutgoingPhoneCall call={call} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should end call', () => {
        const call = mockOutgoingCall(integrationId) as Call

        const {getByTestId} = render(
            <Provider store={store}>
                <OutgoingPhoneCall call={call} />
            </Provider>
        )

        fireEvent.click(getByTestId('end-call-button'))
        expect(call.disconnect).toHaveBeenCalled()
    })
})
