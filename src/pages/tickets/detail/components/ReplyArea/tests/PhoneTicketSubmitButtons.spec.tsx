import React from 'react'
import {render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {Device} from '@twilio/voice-sdk'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import {mockDevice} from '../../../../../../tests/twilioMocks'
import {initialState} from '../../../../../../state/twilio/reducers'
import PhoneTicketSubmitButtons from '../PhoneTicketSubmitButtons'

describe('<PhoneTicketSubmitButtons/>', () => {
    let store: MockStoreEnhanced
    const integrationId = 1
    const validFromAddress = '+14158880101'
    const validToAddress = '+33611223344'
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    function getSource(
        fromId: number | null = integrationId,
        fromAddress: string | null = validFromAddress,
        toAddress: string | null = validToAddress
    ) {
        return {
            from: {
                id: fromId,
                address: fromAddress,
            },
            to: [
                {
                    address: toAddress,
                    name: 'Bob',
                },
            ],
        }
    }

    function getState(
        device: Device | null = mockDevice() as Device,
        source: any = getSource()
    ) {
        return {
            twilio: {
                ...initialState,
                device,
            },
            newMessage: fromJS({
                newMessage: {
                    source,
                },
            }),
        }
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', () => {
        const state = getState()
        store = mockStore(state)

        const {container} = render(
            <Provider store={store}>
                <PhoneTicketSubmitButtons />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    const invalidStates = [
        getState(null, getSource()), // Missing device
        getState(null, getSource(null)), // Missing integration ID
        getState(null, getSource(integrationId, null)), // Missing from address
        getState(null, getSource(integrationId, validFromAddress, null)), // Missing to address
    ]

    it.each(invalidStates)(
        'should render as disabled because the state is invalid',
        (invalidState) => {
            store = mockStore(invalidState)

            const {container} = render(
                <Provider store={store}>
                    <PhoneTicketSubmitButtons />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
