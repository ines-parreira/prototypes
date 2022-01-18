import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'

import {phoneNumbers} from 'fixtures/phoneNumber'

import PhoneNumberCreateForm from '../PhoneNumberCreateForm'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneNumberCreateForm/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberCreateForm />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when a country and a state are selected', () => {
            const {container, getByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateForm />
                </Provider>
            )

            fireEvent.click(getByText('United States'))
            fireEvent.click(getByText('Local'))
            fireEvent.click(getByText('Alabama'))

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when type "Toll-free" is selected', () => {
            const {container, getByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateForm />
                </Provider>
            )

            fireEvent.click(getByText('Canada'))
            fireEvent.click(getByText('Toll-free'))

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render address validation form for Australia or United Kingdom', () => {
            const {container, getByText, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateForm />
                </Provider>
            )

            fireEvent.click(getByText('United States'))
            expect(queryByText('Address verification')).toBe(null)

            fireEvent.click(getByText('Canada'))
            expect(queryByText('Address verification')).toBe(null)

            fireEvent.click(getByText('United Kingdom'))
            expect(queryByText('Address verification')).not.toBe(null)

            fireEvent.click(getByText('Australia'))
            expect(queryByText('Address verification')).not.toBe(null)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
