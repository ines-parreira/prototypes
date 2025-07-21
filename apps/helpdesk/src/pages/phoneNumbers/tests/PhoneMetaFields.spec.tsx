import { render } from '@testing-library/react'

import { PhoneCountry, PhoneType } from 'business/twilio'
import { PhoneNumberMeta } from 'models/phoneNumber/types'
import { assumeMock } from 'utils/testing'

import PhoneMetaFields from '../PhoneMetaFields'
import { shouldDisplayType } from '../utils'

jest.mock('../utils', () => ({
    ...jest.requireActual('../utils'),
    shouldDisplayType: jest.fn(),
}))

const mockShouldDisplayType = assumeMock(shouldDisplayType)

describe('<PhoneMetaFields />', () => {
    const onChange: jest.MockedFunction<
        (value: Partial<PhoneNumberMeta>) => void
    > = jest.fn()

    beforeEach(() => {
        mockShouldDisplayType.mockReturnValue(true)
    })

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

    it('should render type field when shouldDisplayType returns true', () => {
        mockShouldDisplayType.mockReturnValue(true)

        const { getByLabelText } = render(
            <PhoneMetaFields
                onChange={onChange}
                value={{ country: PhoneCountry.US, type: PhoneType.Local }}
            />,
        )

        expect(getByLabelText('Type')).toBeInTheDocument()
    })

    it('should not render type field when shouldDisplayType returns false', () => {
        mockShouldDisplayType.mockReturnValue(false)

        const { queryByLabelText } = render(
            <PhoneMetaFields
                onChange={onChange}
                value={{ country: PhoneCountry.US, type: PhoneType.Local }}
            />,
        )

        expect(queryByLabelText('Type')).toBe(null)
    })
})
