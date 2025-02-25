import React from 'react'

import { render } from '@testing-library/react'

import { PhoneCountry, PhoneType } from 'business/twilio'
import { PhoneNumberMeta } from 'models/phoneNumber/types'

import PhoneMetaFields from '../PhoneMetaFields'

describe('<PhoneMetaFields />', () => {
    const onChange: jest.MockedFunction<
        (value: Partial<PhoneNumberMeta>) => void
    > = jest.fn()

    it('should render when a country and a state are selected', () => {
        const { queryByText } = render(
            <PhoneMetaFields
                onChange={onChange}
                value={{
                    country: PhoneCountry.US,
                    type: PhoneType.Local,
                    state: 'AL',
                }}
            />,
        )

        expect(queryByText('United States')).not.toBe(null)
        expect(queryByText('Local')).not.toBe(null)
        expect(queryByText('Alabama')).not.toBe(null)
    })

    it('should render when a country and a state are selected', () => {
        const { queryByText } = render(
            <PhoneMetaFields
                onChange={onChange}
                value={{
                    country: PhoneCountry.CA,
                    type: PhoneType.TollFree,
                }}
            />,
        )

        expect(queryByText('Canada')).not.toBe(null)
        expect(queryByText('Toll-free')).not.toBe(null)
        expect(queryByText('State')).toBe(null)
    })
})
