import { createRef } from 'react'

import { reportError } from '@repo/logging'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { PhoneNumberInputHandle } from '../PhoneNumberInput'
import PhoneNumberInput from '../PhoneNumberInput'

jest.mock('@repo/logging')

jest.mock('lodash/uniqueId', () => (id: string) => `${id || ''}42`)
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div data-testid="loader" />
))

describe('<PhoneNumberInput/>', () => {
    const onChange: jest.MockedFunction<(value: string) => void> = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should allow typing inside the input, keeping country calling code prefix', () => {
        const { container } = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '555' },
        })

        expect(onChange).toHaveBeenCalledWith('+1555')
    })

    it('should restrict the input to numbers only', () => {
        const { container } = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: 'a23b()45+6' },
        })

        expect(onChange).toHaveBeenCalledWith('+123456')
    })

    it('should allow typing letters if onLetterEntered is provided', () => {
        const onLetterEntered = jest.fn()
        const { container } = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                onLetterEntered={onLetterEntered}
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: 'a23b()45+6' },
        })

        expect(onChange).not.toHaveBeenCalled()
        expect(onLetterEntered).toHaveBeenCalledWith('a23b()45+6')
    })

    it('should display the clear icon when isClearable is true', () => {
        const { getByRole } = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                isClearable
            />,
        )

        fireEvent.click(getByRole('button', { name: 'close' }))

        expect(onChange).toHaveBeenCalledWith('')
    })

    it('should trigger onChange when ref.current.onChange is called', () => {
        const ref = createRef<PhoneNumberInputHandle>()
        render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                ref={ref}
            />,
        )
        ref.current?.onChange('555')

        expect(onChange).toHaveBeenCalledWith('+1555')
    })

    it('should not display the clear icon when isClearable is false', () => {
        const { queryByRole } = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />,
        )

        expect(queryByRole('button', { name: 'close' })).toBeNull()
    })

    it('should filter the country list when typing a country name', async () => {
        const { container, getByText } = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />,
        )

        fireEvent.click(getByText('🇺🇸'))
        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: 'france' },
        })
        await waitFor(() => {
            expect(getByText('France')).toBeVisible()
        })
    })

    it('should restrict selectable countries based on props', () => {
        const { getByText, queryByText } = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                allowedCountries={['US', 'GB']}
            />,
        )

        fireEvent.click(getByText('🇺🇸'))
        expect(queryByText('France')).toBeNull()
    })

    it('should obey the defaultCountry prop if value is empty', () => {
        const { container } = render(
            <PhoneNumberInput
                value=""
                onChange={onChange}
                defaultCountry="FR"
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '555' },
        })

        expect(onChange).toHaveBeenCalledWith('+33555')
    })

    it('should infer country from value, regardless of defaultCountry', () => {
        const { container } = render(
            <PhoneNumberInput
                value="+123456"
                onChange={onChange}
                defaultCountry="FR"
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '555' },
        })

        expect(onChange).toHaveBeenCalledWith('+1555')
    })

    it('should infer correct country from value', () => {
        const { container, getByText } = render(
            <PhoneNumberInput
                value=""
                onChange={onChange}
                defaultCountry="US"
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '+373 600 00 000' },
        })
        expect(getByText(/\+373/i)).toBeVisible()

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '+1 251 261 0000' },
        })
        expect(getByText(/\+1/i)).toBeVisible()

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '+40 750 000 000' },
        })
        expect(getByText(/\+40/i)).toBeVisible()
    })

    it('should change the input when selecting a new country', () => {
        const { container, getByText } = render(
            <PhoneNumberInput value="+37360000000" onChange={onChange} />,
        )

        fireEvent.click(getByText('🇲🇩'))
        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: 'france' },
        })
        fireEvent.click(getByText('France'))

        expect(onChange).toHaveBeenLastCalledWith('+3360000000')
    })

    it('should report an error if the default country is not allowed', () => {
        render(
            <PhoneNumberInput
                value=""
                allowedCountries={['US', 'CA']}
                onChange={onChange}
                defaultCountry="FR"
            />,
        )

        expect(
            reportError as jest.MockedFunction<typeof reportError>,
        ).toHaveBeenCalledWith(
            new Error('Wrong props passed to PhoneNumberInput'),
            expect.any(Object),
        )
    })

    it('should render even if country inferred from value is not in given countries', () => {
        const { container } = render(
            <PhoneNumberInput
                value="+33123456"
                allowedCountries={['US', 'CA']}
                onChange={onChange}
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            target: { value: '555' },
        })

        expect(onChange).toHaveBeenCalledWith('+33555')
    })

    it('should display error message if phone number is too long', () => {
        const { container, getByText } = render(
            <PhoneNumberInput
                value="+33123456"
                allowedCountries={['US', 'CA']}
                onChange={onChange}
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            // 16 5s
            target: { value: '5555555555555555' },
        })

        getByText("A phone number can't have more than 15 digits")

        expect(
            container
                .getElementsByTagName('span')[0]
                .classList.contains('hasError'),
        ).toBe(true)
    })

    it('should not display error message if phone number is not too long', () => {
        const { container, queryByText } = render(
            <PhoneNumberInput
                value="+33123456"
                allowedCountries={['US', 'CA']}
                onChange={onChange}
            />,
        )

        fireEvent.change(container.getElementsByTagName('input')[0], {
            // 15 5s
            target: { value: '555555555555555' },
        })

        expect(
            queryByText("A phone number can't have more than 15 digits"),
        ).toBeNull()

        expect(
            container
                .getElementsByTagName('span')[0]
                .classList.contains('hasError'),
        ).toBe(false)
    })

    it('should not autofocus on the text input', () => {
        render(<PhoneNumberInput value="+1234567890" onChange={onChange} />)
        expect(document.activeElement).not.toEqual(
            document.getElementsByTagName('input')[0],
        )
    })

    it('should autofocus on the text input', () => {
        render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                autoFocus
            />,
        )
        expect(document.activeElement).toEqual(
            document.getElementsByTagName('input')[0],
        )
    })

    it('should display loader when isLoading is true', () => {
        const { getByTestId } = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                isLoading
            />,
        )

        expect(getByTestId('loader')).toBeVisible()
    })

    it('should change country code when ref.onCountryChange is called', () => {
        const ref = createRef<PhoneNumberInputHandle>()
        const { getByText } = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                ref={ref}
            />,
        )

        act(() => {
            ref.current?.onCountryChange('FR')
        })

        expect(getByText('🇫🇷')).toBeVisible()
    })

    it('should not call onChange when changing country with empty input', async () => {
        const user = userEvent.setup()

        const { getByText } = render(
            <PhoneNumberInput
                value=""
                onChange={onChange}
                defaultCountry="US"
            />,
        )

        await user.click(getByText('🇺🇸'))
        await user.click(getByText('France'))

        expect(onChange).not.toHaveBeenCalled()
    })

    it('should not render empty caption by default', () => {
        const { container } = render(
            <PhoneNumberInput value="+1234567890" onChange={onChange} />,
        )

        const getCaptions = () =>
            container.querySelectorAll('[class*="caption"]')

        expect(getCaptions()).toHaveLength(0)
    })

    it('should render empty caption when suppressUIJumps is true', () => {
        const { container } = render(
            <PhoneNumberInput
                value="+1234567890"
                onChange={onChange}
                suppressUIJumps
            />,
        )

        const getCaptions = () =>
            container.querySelectorAll('[class*="caption"]')

        expect(getCaptions()).toHaveLength(1)
        expect(getCaptions()[0].textContent).toBe('')
    })
})
