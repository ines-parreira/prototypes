import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'
import produce from 'immer'

import {countriesRequiringState} from 'config/countries'

import BillingAddressInputs from '../BillingAddressInputs'

jest.mock('config/countries', () => {
    const countryConfig = jest.requireActual('config/countries')
    return {
        ...countryConfig,
        countries: [
            {label: 'France', value: 'FR'},
            {
                label: 'United States',
                value: 'US',
            },
        ],
    } as unknown
})

describe('<BillingAddressInputs />', () => {
    const minProps: ComponentProps<typeof BillingAddressInputs> = {
        onChange: jest.fn(),
        value: {
            email: '',
            shipping: {
                name: '',
                phone: '',
                address: {
                    line1: '',
                    line2: '',
                    country: '',
                    postal_code: '',
                    city: '',
                    state: '',
                },
            },
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the billing address inputs', () => {
        const {container} = render(<BillingAddressInputs {...minProps} />)

        expect(container).toMatchSnapshot()
    })

    it.each(countriesRequiringState)(
        'should render the state input when the selected country is %s',
        (country) => {
            const {getByPlaceholderText} = render(
                <BillingAddressInputs
                    {...minProps}
                    value={produce(minProps.value, (nextValue) => {
                        nextValue.shipping.address.country = country
                    })}
                />
            )

            expect(getByPlaceholderText('CA')).toBeTruthy()
        }
    )

    it('should call onChange when updating a value', () => {
        const {getByPlaceholderText} = render(
            <BillingAddressInputs {...minProps} />
        )

        fireEvent.change(getByPlaceholderText('your@email.com'), {
            target: {value: 'foo'},
        })
        expect(minProps.onChange).toHaveBeenLastCalledWith({
            email: 'foo',
            shipping: {
                name: '',
                phone: '',
                address: {
                    city: '',
                    country: '',
                    line1: '',
                    line2: '',
                    postal_code: '',
                    state: '',
                },
            },
        })
    })

    it('should call onChange with an empty state property, when the country is not US', () => {
        const {getByLabelText} = render(
            <BillingAddressInputs
                {...minProps}
                value={produce(minProps.value, (nextValue) => {
                    nextValue.shipping.address.country = 'US'
                    nextValue.shipping.address.state = 'New York'
                })}
            />
        )

        fireEvent.change(getByLabelText('Country'), {
            target: {value: 'FR'},
        })
        expect(minProps.onChange).toHaveBeenLastCalledWith({
            email: '',
            shipping: {
                name: '',
                phone: '',
                address: {
                    city: '',
                    country: 'FR',
                    line1: '',
                    line2: '',
                    postal_code: '',
                    state: '',
                },
            },
        })
    })
})
