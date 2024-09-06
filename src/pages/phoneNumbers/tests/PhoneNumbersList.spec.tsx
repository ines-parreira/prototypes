import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {within} from '@testing-library/dom'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {phoneNumbers} from 'fixtures/newPhoneNumber'
import {RootState, StoreDispatch} from 'state/types'

import PhoneNumbersList from '../PhoneNumbersList'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        newPhoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneNumbersList/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumbersList />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should allow sorting by column header', () => {
            const {getByText, getAllByRole} = render(
                <Provider store={store}>
                    <PhoneNumbersList />
                </Provider>
            )

            const getRows = () =>
                getAllByRole('row').map((row) =>
                    within(row)
                        .queryAllByRole('cell')
                        .map((cell) => cell.textContent)
                )

            const rowsBeforeSorting = getRows()

            expect(rowsBeforeSorting[1].slice(0, 1)).toEqual([
                '🇨🇦Intl. Phone Number +1 213 373 4255',
            ])
            expect(rowsBeforeSorting[2].slice(0, 1)).toEqual([
                '🇨🇦Another Phone Number +1 213 373 4254',
            ])
            expect(rowsBeforeSorting[3].slice(0, 1)).toEqual([
                '🇺🇸A Phone Number +1 213 373 4253',
            ])

            fireEvent.click(getByText('Phone Number'))

            const rowsAfterSorting = getRows()

            expect(rowsAfterSorting[1].slice(0, 1)).toEqual([
                '🇺🇸A Phone Number +1 213 373 4253',
            ])
            expect(rowsAfterSorting[2].slice(0, 1)).toEqual([
                '🇨🇦Another Phone Number +1 213 373 4254',
            ])
            expect(rowsAfterSorting[3].slice(0, 1)).toEqual([
                '🇨🇦Intl. Phone Number +1 213 373 4255',
            ])
        })
    })
})
