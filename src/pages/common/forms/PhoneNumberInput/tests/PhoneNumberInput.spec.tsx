import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {reportError} from 'utils/errors'
import PhoneNumberInput from '../PhoneNumberInput'

jest.mock('utils/errors')

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

describe('<PhoneNumberInput/>', () => {
    const onChange: jest.MockedFunction<(value: string) => void> = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <PhoneNumberInput
                label="Your phone number"
                value="+1234567890"
                onChange={onChange}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow typing inside the input, keeping country calling code prefix', () => {
        const {container} = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {value: '555'},
        })

        expect(onChange).toHaveBeenCalledWith('+1555')
    })

    it('should restrict the input to numbers only', () => {
        const {container} = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {value: 'a23b()45+6'},
        })

        expect(onChange).toHaveBeenCalledWith('+123456')
    })

    it('should filter the country list when typing a country name', () => {
        const {container, getByText} = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />
        )

        fireEvent.click(getByText('🇺🇸'))
        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {value: 'france'},
        })
        fireEvent.click(getByText('France'))

        expect(onChange).toHaveBeenCalledWith('+33234567890')
    })

    it('should restrict selectable countries based on props', () => {
        const {getByText, queryByText} = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                allowedCountries={['US', 'GB']}
            />
        )

        fireEvent.click(getByText('🇺🇸'))
        expect(queryByText('France')).toBeNull()
    })

    it('should obey the defaultCountry prop if value is empty', () => {
        const {container} = render(
            <PhoneNumberInput
                value=""
                onChange={onChange}
                defaultCountry="FR"
            />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {value: '555'},
        })

        expect(onChange).toHaveBeenCalledWith('+33555')
    })

    it('should infer country from value, regardless of defaultCountry', () => {
        const {container} = render(
            <PhoneNumberInput
                value="+123456"
                onChange={onChange}
                defaultCountry="FR"
            />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {value: '555'},
        })

        expect(onChange).toHaveBeenCalledWith('+1555')
    })

    it('should report an error if the default country is not allowed', () => {
        render(
            <PhoneNumberInput
                value=""
                allowedCountries={['US', 'CA']}
                onChange={onChange}
                defaultCountry="FR"
            />
        )

        expect(
            (reportError as jest.MockedFunction<typeof reportError>).mock.calls
        ).toMatchSnapshot()
    })

    it('should render even if country inferred from value is not in given countries', () => {
        const {container} = render(
            <PhoneNumberInput
                value="+33123456"
                allowedCountries={['US', 'CA']}
                onChange={onChange}
            />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: {value: '555'},
        })

        expect(onChange).toHaveBeenCalledWith('+33555')
    })

    it('should display error message if phone number is too long', () => {
        const {container, getByText} = render(
            <PhoneNumberInput
                value="+33123456"
                allowedCountries={['US', 'CA']}
                onChange={onChange}
            />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            // 16 5s
            target: {value: '5555555555555555'},
        })

        getByText("A phone number can't have more than 15 digits")

        expect(
            container
                .getElementsByTagName('span')[0]
                .classList.contains('hasError')
        ).toBe(true)
    })

    it('should not display error message if phone number is not too long', () => {
        const {container, queryByText} = render(
            <PhoneNumberInput
                value="+33123456"
                allowedCountries={['US', 'CA']}
                onChange={onChange}
            />
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            // 15 5s
            target: {value: '555555555555555'},
        })

        expect(
            queryByText("A phone number can't have more than 15 digits")
        ).toBeNull()

        expect(
            container
                .getElementsByTagName('span')[0]
                .classList.contains('hasError')
        ).toBe(false)
    })

    it('should not autofocus on the text input', () => {
        render(<PhoneNumberInput value="+1234567890" onChange={onChange} />)
        expect(document.activeElement).not.toEqual(
            document.getElementsByTagName('input')[0]
        )
    })

    it('should autofocus on the text input', () => {
        render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                autoFocus
            />
        )
        expect(document.activeElement).toEqual(
            document.getElementsByTagName('input')[0]
        )
    })
})
