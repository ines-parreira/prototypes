import { useState } from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InputAction } from './InputAction'

describe('<InputAction />', () => {
    it('renders input and button', () => {
        render(<InputAction value="" />)
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('disables button when input is empty', () => {
        render(<InputAction value="" />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disables button when phone number is invalid', () => {
        render(<InputAction value="+1 234" />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('enables button when phone number is valid', () => {
        render(<InputAction value="+1 201 555 0123" />)
        expect(screen.getByRole('button')).toBeEnabled()
    })

    describe('Typing phone numbers', () => {
        it('formats US phone number as you type', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.type(input, '+12015550123'))
            expect(input).toHaveValue('+1 201 555 0123')
        })

        it('maintains cursor position when deleting in the middle', async () => {
            function Wrapper() {
                const [value, setValue] = useState('+1 201 555 0123')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox') as HTMLInputElement

            input.focus()
            input.setSelectionRange(5, 6)

            const newValue = '+1 20 555 0123'
            fireEvent.change(input, {
                target: { value: newValue, selectionStart: 5 },
            })

            expect(input).toHaveValue('+1 205 550 123')

            await waitFor(() => {
                expect(input.selectionStart).toBe(5)
            })
        })

        it('formats UK phone number as you type', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.type(input, '+447911123456'))
            expect(input).toHaveValue('+44 7911 123456')
        })

        it('formats French phone number as you type', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.type(input, '+33612345678'))
            expect(input).toHaveValue('+33 6 12 34 56 78')
        })

        it('handles incomplete phone number gracefully', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.type(input, '+1555'))
            expect(input).toHaveValue('+1 555')
        })

        it('filters out letters when typing', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.type(input, '+1abc555def123'))
            expect(input).toHaveValue('+1 555 123')
        })
    })

    describe('Pasting phone numbers', () => {
        it('handles pasted US phone number with country code', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+12015550123'))
            expect(input).toHaveValue('+1 201 555 0123')
        })

        it('handles pasted UK phone number', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+447911123456'))
            expect(input).toHaveValue('+44 7911 123456')
        })

        it('handles pasted French phone number', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+33612345678'))
            expect(input).toHaveValue('+33 6 12 34 56 78')
        })

        it('handles pasted formatted US number with parentheses and dashes', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+1 (201) 555-0123'))
            expect(input).toHaveValue('+1 201 555 0123')
        })

        it('handles pasted US number with spaces and dashes', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+1-201-555-0123'))
            expect(input).toHaveValue('+1 201 555 0123')
        })

        it('handles pasted German phone number', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+4915123456789'))
            expect(input).toHaveValue('+49 1512 3456789')
        })

        it('handles pasted phone number with letters and symbols', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+1 (201) ABC-5550123'))
            expect(input).toHaveValue('+1 201 555 0123')
        })

        it('handles pasted incomplete phone number', async () => {
            const user = userEvent.setup()
            function Wrapper() {
                const [value, setValue] = useState('')
                return <InputAction value={value} onChange={setValue} />
            }
            render(<Wrapper />)
            const input = screen.getByRole('textbox')

            await act(() => user.click(input))
            await act(() => user.paste('+1555'))
            expect(input).toHaveValue('+1 555')
        })
    })

    describe('Button state', () => {
        it('enables button for complete US phone number', () => {
            render(<InputAction value="+1 201 555 0123" />)
            expect(screen.getByRole('button')).toBeEnabled()
        })

        it('enables button for complete UK phone number', () => {
            render(<InputAction value="+44 7911 123456" />)
            expect(screen.getByRole('button')).toBeEnabled()
        })

        it('enables button for complete French phone number', () => {
            render(<InputAction value="+33 6 12 34 56 78" />)
            expect(screen.getByRole('button')).toBeEnabled()
        })

        it('disables button for incomplete phone number', () => {
            render(<InputAction value="+1 555" />)
            expect(screen.getByRole('button')).toBeDisabled()
        })

        it('disables button for phone number without country code', () => {
            render(<InputAction value="5551234567" />)
            expect(screen.getByRole('button')).toBeDisabled()
        })

        it('disables button when sending', async () => {
            const user = userEvent.setup()
            const onActionClick = jest
                .fn()
                .mockImplementation(
                    () => new Promise((resolve) => setTimeout(resolve, 100)),
                )

            render(
                <InputAction
                    value="+1 201 555 0123"
                    onActionClick={onActionClick}
                />,
            )

            const button = screen.getByRole('button')
            expect(button).toBeEnabled()

            await act(() => user.click(button))
            expect(button).toBeDisabled()
        })
    })

    it('clears input when empty value is provided', async () => {
        const user = userEvent.setup()
        function Wrapper() {
            const [value, setValue] = useState('+1 201 555 0123')
            return <InputAction value={value} onChange={setValue} />
        }
        render(<Wrapper />)
        const input = screen.getByRole('textbox')

        await act(() => user.clear(input))
        expect(input).toHaveValue('')
    })
})
