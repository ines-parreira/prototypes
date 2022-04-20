import React from 'react'
import {render} from '@testing-library/react'
import {PhoneCountry} from 'models/phoneNumber/types'
import PhoneNumberAddressValidationAlert from '../PhoneNumberAddressValidationAlert'

describe('<PhoneNumberAddressValidationAlert />', () => {
    describe('render()', () => {
        it('should render a link to request form for FR', () => {
            const {container} = render(
                <PhoneNumberAddressValidationAlert country={PhoneCountry.FR} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it.each([
            PhoneCountry.US,
            PhoneCountry.CA,
            PhoneCountry.GB,
            PhoneCountry.AU,
        ])('should not render for any other country', (country) => {
            const {container} = render(
                <PhoneNumberAddressValidationAlert country={country} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
