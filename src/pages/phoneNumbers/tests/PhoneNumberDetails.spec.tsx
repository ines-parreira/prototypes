import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {phoneNumbers} from 'fixtures/phoneNumber'
import {RootState, StoreDispatch} from 'state/types'

import PhoneNumberDetails from '../PhoneNumberDetails'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneNumberDetails/>', () => {
    describe('render()', () => {
        it('should render with a local US number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[0]} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a toll-free CA number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[1]} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with a mobile GB number', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberDetails phoneNumber={phoneNumbers[2]} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
