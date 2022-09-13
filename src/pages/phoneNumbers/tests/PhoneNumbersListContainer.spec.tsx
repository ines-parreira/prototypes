import React from 'react'
import {act, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import MockAdapter from 'axios-mock-adapter'
import {phoneNumbers} from 'fixtures/phoneNumber'
import {RootState, StoreDispatch} from 'state/types'

import client from 'models/api/resources'
import {flushPromises} from 'utils/testing'
import PhoneNumberListContainer from '../PhoneNumbersListContainer'

const mockServer = new MockAdapter(client)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)
const storeNoNumbers = mockStore({
    entities: {
        phoneNumbers: {},
    },
} as RootState)

describe('<PhoneNumberListContainer />', () => {
    beforeEach(() => {
        mockServer.reset()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('render()', () => {
        it('should render with a number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberListContainer />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render Candu selector without numbers', async () => {
            const {container} = render(
                <Provider store={storeNoNumbers}>
                    <PhoneNumberListContainer />
                </Provider>
            )

            await act(async () => {
                await flushPromises()
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
