import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StealthInput from '../StealthInput'

describe('<StealthInput />', () => {
    const initialProps = {
        id: '1',
        hasError: false,
        onChange: jest.fn(),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
    }

    it('should render correctly', () => {
        render(<StealthInput {...initialProps} defaultValue="something" />)
        expect(screen.getByDisplayValue('something')).toBeInTheDocument()
    })

    it('should call correct handlers when interacting', async () => {
        render(<StealthInput {...initialProps} />)
        const input = screen.getByRole('textbox')
        expect(input.classList.contains('stealth')).toBe(true)
        expect(input.classList.contains('valid')).toBe(false)
        fireEvent.focus(input)
        expect(input.classList.contains('stealth')).toBe(false)
        expect(input.classList.contains('valid')).toBe(true)
        expect(initialProps.onFocus).toHaveBeenCalledTimes(1)
        await userEvent.type(input, 'test')
        expect(initialProps.onChange).toHaveBeenCalledTimes(4)
        fireEvent.blur(input)
        expect(initialProps.onBlur).toHaveBeenCalledTimes(1)
        expect(input.classList.contains('stealth')).toBe(true)
        expect(input.classList.contains('valid')).toBe(false)
    })

    it('should handle errors correctly', () => {
        render(<StealthInput {...initialProps} hasError />)
        expect(screen.getByRole('textbox').classList.contains('invalid')).toBe(
            true,
        )
    })
})
