import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ColorPicker } from '../ColorPicker'

const defaultProps = {
    onChange: jest.fn(),
}

describe('<ColorPicker />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render the text input', () => {
            render(<ColorPicker {...defaultProps} />)

            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should render with placeholder', () => {
            render(<ColorPicker {...defaultProps} />)

            expect(screen.getByPlaceholderText('#000000')).toBeInTheDocument()
        })

        it('should display the provided value', () => {
            render(<ColorPicker {...defaultProps} value="#FF0000" />)

            expect(screen.getByRole('textbox')).toHaveValue('#FF0000')
        })

        it('should render the color swatch button', () => {
            render(<ColorPicker {...defaultProps} label="Main color" />)

            expect(
                screen.getByRole('button', {
                    name: /color-picker_main_color/i,
                }),
            ).toBeInTheDocument()
        })

        it('should use default aria-label when no label provided', () => {
            render(<ColorPicker {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: 'color-picker' }),
            ).toBeInTheDocument()
        })
    })

    describe('text input', () => {
        it('should call onChange when typing in the text field', async () => {
            const onChange = jest.fn()
            render(<ColorPicker {...defaultProps} onChange={onChange} />)

            const input = screen.getByRole('textbox')
            await act(() => userEvent.type(input, '#123456'))

            expect(onChange).toHaveBeenCalled()
        })

        it('should trim whitespace from input', async () => {
            const onChange = jest.fn()
            render(<ColorPicker {...defaultProps} onChange={onChange} />)

            const input = screen.getByRole('textbox')
            await act(() => userEvent.clear(input))
            await act(() => userEvent.type(input, '  #AABBCC  '))

            const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
            expect(lastCall[0]).not.toMatch(/^\s|\s$/)
        })

        it('should reset to default color on blur when value is invalid', async () => {
            const onChange = jest.fn()
            render(
                <ColorPicker
                    {...defaultProps}
                    value="#"
                    onChange={onChange}
                    defaultValue="#FF0000"
                />,
            )

            const input = screen.getByRole('textbox')
            await act(() => userEvent.click(input))
            act(() => input.blur())

            expect(onChange).toHaveBeenCalledWith('#FF0000')
        })

        it('should reset to default color on blur when no defaultValue provided', async () => {
            const onChange = jest.fn()
            render(
                <ColorPicker {...defaultProps} value="#" onChange={onChange} />,
            )

            const input = screen.getByRole('textbox')
            await act(() => userEvent.click(input))
            act(() => input.blur())

            expect(onChange).toHaveBeenCalledWith(
                expect.stringMatching(/^#[A-F0-9]{6}$/i),
            )
        })

        it('should not reset valid color on blur', async () => {
            const onChange = jest.fn()
            render(
                <ColorPicker
                    {...defaultProps}
                    value="#AABBCC"
                    onChange={onChange}
                />,
            )

            const input = screen.getByRole('textbox')
            await act(() => userEvent.click(input))
            act(() => input.blur())

            expect(onChange).not.toHaveBeenCalled()
        })
    })

    describe('color popup', () => {
        it('should open color popup when swatch button is clicked', async () => {
            render(<ColorPicker {...defaultProps} label="Test" />)

            const swatchButton = screen.getByRole('button', {
                name: /color-picker_test/i,
            })
            await act(() => userEvent.click(swatchButton))

            const colorButtons = screen.getAllByRole('button', {
                name: /select color #/i,
            })
            expect(colorButtons.length).toBeGreaterThan(0)
        })

        it('should render color grid options', async () => {
            render(<ColorPicker {...defaultProps} />)

            const swatchButton = screen.getByRole('button', {
                name: 'color-picker',
            })
            await act(() => userEvent.click(swatchButton))

            const colorButtons = screen.getAllByRole('button', {
                name: /select color #/i,
            })
            // ColorGrid generates 8 hues × 9 columns = 72 colors
            expect(colorButtons).toHaveLength(72)
        })

        it('should call onChange when a color is selected', async () => {
            const onChange = jest.fn()
            render(<ColorPicker {...defaultProps} onChange={onChange} />)

            const swatchButton = screen.getByRole('button', {
                name: 'color-picker',
            })
            await act(() => userEvent.click(swatchButton))

            const colorButtons = screen.getAllByRole('button', {
                name: /select color #/i,
            })
            await act(() => userEvent.click(colorButtons[0]))

            expect(onChange).toHaveBeenCalledWith(
                expect.stringMatching(/^#[A-F0-9]{6}$/i),
            )
        })

        it('should close popup after selecting a color', async () => {
            render(<ColorPicker {...defaultProps} />)

            const swatchButton = screen.getByRole('button', {
                name: 'color-picker',
            })
            await act(() => userEvent.click(swatchButton))

            const colorButtons = screen.getAllByRole('button', {
                name: /select color #/i,
            })
            await act(() => userEvent.click(colorButtons[0]))

            expect(
                screen.queryAllByRole('button', { name: /select color #/i }),
            ).toHaveLength(0)
        })
    })

    describe('color swatch display', () => {
        it('should display default color background when no value provided', () => {
            render(<ColorPicker {...defaultProps} />)

            const swatchButton = screen.getByRole('button', {
                name: 'color-picker',
            })
            const swatch = swatchButton.querySelector(
                '[style*="background-color"]',
            )

            expect(swatch).toHaveStyle({ backgroundColor: '#EB144C' })
        })

        it('should display the current color value in swatch', () => {
            render(<ColorPicker {...defaultProps} value="#FF0000" />)

            const swatchButton = screen.getByRole('button', {
                name: 'color-picker',
            })
            const swatch = swatchButton.querySelector(
                '[style*="background-color"]',
            )

            expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
        })

        it('should use defaultValue when value is not provided', () => {
            render(<ColorPicker {...defaultProps} defaultValue="#00FF00" />)

            const swatchButton = screen.getByRole('button', {
                name: 'color-picker',
            })
            const swatch = swatchButton.querySelector(
                '[style*="background-color"]',
            )

            expect(swatch).toHaveStyle({ backgroundColor: '#00FF00' })
        })
    })
})
