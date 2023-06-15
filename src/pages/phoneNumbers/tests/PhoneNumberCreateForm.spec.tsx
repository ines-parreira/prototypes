import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import {phoneNumbers, capabilities} from 'fixtures/phoneNumber'
import {fetchPhoneCapabilities} from 'models/phoneNumber/resources'
import {assumeMock} from 'utils/testing'
import * as apiCalls from 'models/phoneNumber/resources'

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

jest.mock('models/phoneNumber/resources')
const createPhoneNumberSpy = jest.spyOn(apiCalls, 'createPhoneNumber')

describe('<PhoneNumberCreateForm/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        assumeMock(fetchPhoneCapabilities).mockResolvedValue(capabilities)
    })

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

        it('should pass the address if a phone of a country with address verification is created', async () => {
            const {getByText, getByRole, findByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateForm />
                </Provider>
            )

            await act(async () => {
                fireEvent.change(
                    getByRole('textbox', {
                        name: /title required/i,
                    }),
                    {target: {value: 'test title'}}
                )

                fireEvent.click(getByText('Australia'))

                await findByText('Address verification')

                fireEvent.click(getByText('Adelaide (87)'))

                fireEvent.click(getByText('Business information'))
                fireEvent.change(
                    getByRole('textbox', {name: /business name required/i}),
                    {
                        target: {value: 'test business name'},
                    }
                )
                fireEvent.change(
                    getByRole('textbox', {name: /address required/i}),
                    {
                        target: {value: 'test address'},
                    }
                )
                fireEvent.change(
                    getByRole('textbox', {name: /city required/i}),
                    {
                        target: {value: 'test city'},
                    }
                )
                fireEvent.change(
                    getByRole('textbox', {
                        name: /state\/province\/region required/i,
                    }),
                    {
                        target: {value: 'test region'},
                    }
                )
                fireEvent.change(
                    getByRole('textbox', {name: /postal code required/i}),
                    {
                        target: {value: 'test postal code'},
                    }
                )

                fireEvent.click(getByText('Add phone number'))
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]

            expect(latestCallArguments?.address).toStrictEqual({
                country: 'AU',
                type: 'company',
                business_name: 'test business name',
                address: 'test address',
                city: 'test city',
                region: 'test region',
                postal_code: 'test postal code',
            })
        })

        it('should call createPhoneNumber with the correct payload after switching from country with address verification', async () => {
            const {getByText, getByRole, findByText} = render(
                <Provider store={store}>
                    <PhoneNumberCreateForm />
                </Provider>
            )

            await act(async () => {
                fireEvent.change(
                    getByRole('textbox', {
                        name: /title required/i,
                    }),
                    {target: {value: 'test title'}}
                )

                // change to AU, a country with address verification, and fill one of the address fields
                fireEvent.click(getByText('Australia'))

                await findByText('Address verification')

                fireEvent.change(
                    getByRole('textbox', {name: /business name required/i}),
                    {
                        target: {value: 'test business name'},
                    }
                )

                // switch back to US, a country with no address verificaiton, and create a phone number
                fireEvent.click(getByText('United States'))
                fireEvent.click(getByText('Alabama'))
                fireEvent.click(getByText('Mobile (251)'))

                fireEvent.click(getByText('Add phone number'))
            })

            const latestCallArguments = createPhoneNumberSpy.mock.lastCall?.[0]

            expect(latestCallArguments?.address).toStrictEqual({
                country: 'US',
                type: 'company',
            })
        })
    })
})
