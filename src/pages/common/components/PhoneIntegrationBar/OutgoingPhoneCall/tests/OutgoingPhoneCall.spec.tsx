import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Call} from '@twilio/voice-sdk'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import {RootState, StoreDispatch} from 'state/types'
import {mockOutgoingCall} from 'tests/twilioMocks'

import OutgoingPhoneCall from '../OutgoingPhoneCall'

jest.mock('@twilio/voice-sdk')

describe('<OutgoingPhoneCall/>', () => {
    let state: RootState
    let store: MockStoreEnhanced
    const integrationId = 1
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()
        state = {
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        name: 'My Phone Integration',
                        meta: {emoji: '❤️'},
                    },
                ],
            }),
        } as RootState
        store = mockStore(state)
        mockFlags({})
    })

    it('should render', () => {
        const call = mockOutgoingCall(integrationId) as Call

        render(
            <Provider store={store}>
                <OutgoingPhoneCall call={call} />
            </Provider>
        )

        expect(screen.getByText('My Phone Integration')).toBeInTheDocument()
        expect(
            screen.getByText(
                state.integrations.getIn(['integrations', 0, 'name'])
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Outgoing call to')).toBeInTheDocument()
    })

    it('should end call', () => {
        const call = mockOutgoingCall(integrationId) as Call

        render(
            <Provider store={store}>
                <OutgoingPhoneCall call={call} />
            </Provider>
        )

        fireEvent.click(screen.getByText('End Call'))
        expect(call.disconnect).toHaveBeenCalled()
    })
})
