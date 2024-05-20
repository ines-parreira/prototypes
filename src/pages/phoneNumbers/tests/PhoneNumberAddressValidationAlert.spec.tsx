import React from 'react'
import {render} from '@testing-library/react'
import {PhoneCountry} from 'models/phoneNumber/types'
import PhoneNumberAddressValidationAlert from '../PhoneNumberAddressValidationAlert'

jest.mock('pages/common/components/Alert/Alert', () => {
    return jest.fn(({children}) => <div data-testid="alert">{children}</div>)
})

describe('<PhoneNumberAddressValidationAlert />', () => {
    describe('render()', () => {
        it('should render a link to request form for FR', () => {
            const {getByText} = render(
                <PhoneNumberAddressValidationAlert country={PhoneCountry.FR} />
            )

            expect(getByText(/French number request form/)).toBeVisible()
        })

        it('should render a link to request form for GB', () => {
            const {getByText} = render(
                <PhoneNumberAddressValidationAlert country={PhoneCountry.GB} />
            )

            expect(getByText(/UK purchasing form/)).toBeVisible()
        })

        it.each([PhoneCountry.US, PhoneCountry.CA, PhoneCountry.AU])(
            'should not render for any other country',
            (country) => {
                const {queryByTestId} = render(
                    <PhoneNumberAddressValidationAlert country={country} />
                )

                expect(queryByTestId('alert')).toBeNull()
            }
        )
    })
})
