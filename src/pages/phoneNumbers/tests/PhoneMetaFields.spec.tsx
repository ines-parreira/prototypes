import React from 'react'
import {render} from '@testing-library/react'

import {PhoneNumberMeta} from 'models/phoneNumber/types'
import {PhoneCountry, PhoneType} from 'business/twilio'

import PhoneMetaFields from '../PhoneMetaFields'

describe('<PhoneMetaFields />', () => {
    const onChange: jest.MockedFunction<
        (value: Partial<PhoneNumberMeta>) => void
    > = jest.fn()

    it('should render', () => {
        const {container} = render(
            <PhoneMetaFields onChange={onChange} value={{}} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when a country and a state are selected', () => {
        const {container, queryByText} = render(
            <PhoneMetaFields
                onChange={onChange}
                value={{
                    country: PhoneCountry.US,
                    type: PhoneType.Local,
                    state: 'AB',
                }}
            />
        )

        expect(queryByText('United States')).not.toBe(null)
        expect(queryByText('Local')).not.toBe(null)
        expect(queryByText('Alabama')).not.toBe(null)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when a country and a state are selected', () => {
        const {container, queryByText} = render(
            <PhoneMetaFields
                onChange={onChange}
                value={{
                    country: PhoneCountry.CA,
                    type: PhoneType.TollFree,
                }}
            />
        )

        expect(queryByText('Canada')).not.toBe(null)
        expect(queryByText('Toll-free')).not.toBe(null)
        expect(queryByText('State')).toBe(null)
        expect(container.firstChild).toMatchSnapshot()
    })
})
