import { useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
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

    it('handles US phone number with country code and leading zeros on blur', () => {
        const onChange = jest.fn()
        render(<InputAction value="10551234567" onChange={onChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.blur(input)
        // Should call onChange because leading zero needs to be removed after stripping country code
        expect(onChange).toHaveBeenCalledWith('(551) 234-567_')
    })

    it('disables button when input is empty', () => {
        render(<InputAction value="" />)
        expect(screen.getByRole('button')).toBeDisabled()
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

    describe('US phone number handling', () => {
        it('handles US number with +1 prefix when pasted', async () => {
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await userEvent.clear(input)
            await userEvent.paste('+15551234567')
            expect(input).toHaveValue('(555) 123-4567')
        })

        it('handles US number with 1 prefix when pasted', async () => {
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await userEvent.clear(input)
            await userEvent.paste('15551234567')
            expect(input).toHaveValue('(555) 123-4567')
        })

        it('handles formatted US number with parentheses and dashes when pasted', async () => {
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await userEvent.clear(input)
            await userEvent.paste('+1 (555) 123-4567')
            expect(input).toHaveValue('(555) 123-4567')
        })

        it('handles US number with spaces and dashes when pasted', async () => {
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await userEvent.clear(input)
            await userEvent.paste('1-555-123-4567')
            expect(input).toHaveValue('(555) 123-4567')
        })

        it('ignores more than 10 digits when no US prefix', async () => {
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await userEvent.clear(input)
            await userEvent.paste('55512345678')
            // Should not update since it has more than 10 digits without US prefix
            expect(input).toHaveValue('')
        })

        it('handles 10-digit number without prefix', async () => {
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await userEvent.clear(input)
            await userEvent.paste('5551234567')
            expect(input).toHaveValue('(555) 123-4567')
        })
    })
})
