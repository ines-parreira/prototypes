import React from 'react'

import { fireEvent, render, screen, within } from '@testing-library/react'

import CountryInput from '../CountryInput'

jest.mock('@repo/logging')

describe('<CountryInput/>', () => {
    const onChange: jest.MockedFunction<(value: string) => void> = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', () => {
        const { container } = render(
            <CountryInput label="Country" value="US" onChange={onChange} />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with the defaultCountry prop if value is empty', () => {
        const { findByText } = render(
            <CountryInput onChange={onChange} defaultCountry="FR" />,
        )

        expect(findByText('France')).toBeTruthy()
    })

    it('should render and display the popular / all options', async () => {
        const { getByText } = render(
            <CountryInput
                onChange={onChange}
                defaultCountry="US"
                popularCountries={['US', 'AU', 'GB', 'CA']}
            />,
        )
        fireEvent.click(getByText('🇺🇸'))

        await screen.findByText('POPULAR')

        const popular = within(screen.getByText('POPULAR').parentElement!)

        expect(popular.getByText('United States')).toBeVisible()
        expect(popular.getByText('Australia')).toBeVisible()
        expect(popular.getByText('United Kingdom')).toBeVisible()
        expect(popular.getByText('Canada')).toBeVisible()

        expect(screen.findByText('ALL')).toBeTruthy()
    })
})
