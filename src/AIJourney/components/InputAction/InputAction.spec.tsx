import { useState } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { InputAction } from './InputAction'

describe('<InputAction />', () => {
    it('renders input and button', () => {
        render(<InputAction value="" />)
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls onChange with only digits when typing', async () => {
        function Wrapper() {
            const [val, setVal] = useState('')
            return <InputAction value={val} onChange={setVal} />
        }
        render(<Wrapper />)
        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'abc123')
        expect(input).toHaveValue('(123) ___-____')
    })

    it('removes leading zeros on blur', () => {
        const onChange = jest.fn()
        render(<InputAction value="00123" onChange={onChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.blur(input)
        expect(onChange).toHaveBeenCalledWith('(123) ___-____')
    })

    it('disables button when input is empty', () => {
        render(<InputAction value="" />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disables button when sending', async () => {
        render(<InputAction value="123" />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(button).toBeDisabled()
        await waitFor(() => expect(button).not.toBeDisabled(), {
            timeout: 2500,
        })
    })

    it('shows "Sending SMS..." when sending', async () => {
        render(<InputAction value="123" />)
        const button = screen.getByRole('button')
        await userEvent.click(button)
        expect(button).toHaveTextContent('Sending SMS...')
        await waitFor(() => expect(button).toHaveTextContent('Send test SMS'), {
            timeout: 2500,
        })
    })

    it('prevents non-numeric keys (e, E, +, -)', () => {
        render(<InputAction value="" />)
        const input = screen.getByRole('textbox')

        const keys = ['e', 'E', '+', '-']
        let preventDefaultCount = 0

        keys.forEach((key) => {
            const event = new KeyboardEvent('keydown', {
                key,
                bubbles: true,
                cancelable: true,
            })
            Object.defineProperty(event, 'preventDefault', {
                value: () => {
                    preventDefaultCount++
                },
                writable: true,
            })
            input.dispatchEvent(event)
        })

        // Now test a valid key
        const validEvent = new KeyboardEvent('keydown', {
            key: '2',
            bubbles: true,
            cancelable: true,
        })
        Object.defineProperty(validEvent, 'preventDefault', {
            value: () => {
                preventDefaultCount++
            },
            writable: true,
        })
        input.dispatchEvent(validEvent)

        expect(preventDefaultCount).toBe(4)
    })

    it('formats input as a US phone number while typing', async () => {
        function Wrapper() {
            const [value, setValue] = useState('')
            return <InputAction value={value} onChange={setValue} />
        }
        render(<Wrapper />)
        const input = screen.getByRole('textbox')

        await userEvent.type(input, '1234567890')
        expect(input).toHaveValue('(123) 456-7890')
    })

    it('handles incomplete input gracefully', async () => {
        function Wrapper() {
            const [value, setValue] = useState('')
            return <InputAction value={value} onChange={setValue} />
        }
        render(<Wrapper />)
        const input = screen.getByRole('textbox')

        await userEvent.type(input, '12345')
        expect(input).toHaveValue('(123) 45_-____')
    })
})
