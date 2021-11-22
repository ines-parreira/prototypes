import React from 'react'
import {render} from '@testing-library/react'

import PhoneAddressInformation from '../PhoneAddressInformation'
import {
    AddressInformation,
    AddressType,
} from '../../../../../../models/integration/types'
import {PhoneCountry} from '../../../../../../business/twilio'

describe('<PhoneAddressInformation />', () => {
    const onChange: jest.MockedFunction<
        (value: Partial<AddressInformation>) => void
    > = jest.fn()

    it('should render', () => {
        const {container} = render(
            <PhoneAddressInformation onChange={onChange} value={{}} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow to use company information for validation', () => {
        const {container, queryByLabelText} = render(
            <PhoneAddressInformation
                onChange={onChange}
                value={{
                    type: AddressType.Company,
                }}
            />
        )

        expect(queryByLabelText('Business name')).not.toBe(null)
        expect(queryByLabelText('Name')).toBe(null)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow to use personal information for validation', () => {
        const {container, queryByLabelText} = render(
            <PhoneAddressInformation
                onChange={onChange}
                value={{
                    type: AddressType.Personal,
                }}
            />
        )

        expect(queryByLabelText('Business name')).toBe(null)
        expect(queryByLabelText('Name')).not.toBe(null)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the country name in a disabled field', () => {
        const {
            container,
            getByDisplayValue,
            queryByLabelText,
            queryByDisplayValue,
        } = render(
            <PhoneAddressInformation
                onChange={onChange}
                value={{
                    country: PhoneCountry.AU,
                }}
            />
        )

        expect(queryByLabelText('Country')).not.toBe(null)
        expect(queryByDisplayValue('Australia')).not.toBe(null)
        expect(
            (getByDisplayValue('Australia') as HTMLInputElement).disabled
        ).toBe(true)

        expect(container.firstChild).toMatchSnapshot()
    })
})
