import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import {PhoneNumber} from 'models/phoneNumber/types'

import PhoneNumberCreateModalForm from '../PhoneNumberCreateModalForm'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({})

describe('<PhoneNumberCreateModalForm/>', () => {
    const onCreate: jest.MockedFunction<(value: PhoneNumber) => void> =
        jest.fn()
    const onClose: jest.MockedFunction<() => void> = jest.fn()

    describe('render()', () => {
        it('should not render when isOpen is false', () => {
            const {baseElement} = render(
                <Provider store={store}>
                    <PhoneNumberCreateModalForm
                        onCreate={onCreate}
                        onClose={onClose}
                        isOpen={false}
                    />
                </Provider>
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render when isOpen is true', () => {
            const {baseElement} = render(
                <Provider store={store}>
                    <PhoneNumberCreateModalForm
                        onCreate={onCreate}
                        onClose={onClose}
                        isOpen
                    />
                </Provider>
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render no steps when no address validation is required', () => {
            const {baseElement, getByText, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateModalForm
                        onCreate={onCreate}
                        onClose={onClose}
                        isOpen
                    />
                </Provider>
            )

            fireEvent.click(getByText('United States'))
            expect(queryByText('Create Phone Number')).not.toBe(null)
            expect(queryByText('Next')).toBe(null)
            expect(baseElement).toMatchSnapshot()
        })

        it('should render a second with for address validation for certain countries', () => {
            const {baseElement, getByText, queryByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateModalForm
                        onCreate={onCreate}
                        onClose={onClose}
                        isOpen
                    />
                </Provider>
            )

            fireEvent.click(getByText('Australia'))

            expect(queryByText('Step 1 of 2 - Phone Information')).not.toBe(
                null
            )
            expect(queryByText('Step 2 of 2 - Address Verification')).toBe(null)

            expect(queryByText('Title')).not.toBe(null)
            expect(queryByText('Country')).not.toBe(null)
            expect(queryByText('Area code')).not.toBe(null)

            fireEvent.click(getByText('Next'))

            expect(queryByText('Step 1 of 2 - Phone Information')).toBe(null)
            expect(queryByText('Step 2 of 2 - Address Verification')).not.toBe(
                null
            )

            expect(queryByText('Business name')).not.toBe(null)
            expect(queryByText('Address 1')).not.toBe(null)
            expect(queryByText('Address 2')).not.toBe(null)
            expect(queryByText('City')).not.toBe(null)
            expect(queryByText('State/Province/Region')).not.toBe(null)
            expect(queryByText('Postal Code')).not.toBe(null)
            expect(queryByText('Country')).not.toBe(null)

            fireEvent.click(getByText('Back'))

            expect(queryByText('Step 1 of 2 - Phone Information')).not.toBe(
                null
            )
            expect(queryByText('Step 2 of 2 - Address Verification')).toBe(null)

            expect(queryByText('Title')).not.toBe(null)
            expect(queryByText('Country')).not.toBe(null)
            expect(queryByText('Area code')).not.toBe(null)

            expect(baseElement).toMatchSnapshot()
        })
    })
})
