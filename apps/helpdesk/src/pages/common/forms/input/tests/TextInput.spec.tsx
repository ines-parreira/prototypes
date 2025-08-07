import type { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'

import TextInput from '../TextInput'

jest.mock('lodash/uniqueId', () => () => '42')

// Mock the useTextWidth hook to provide predictable values for testing
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useTextWidth: jest.fn((text: string) => {
        // Simple mock: return 10px per character + base width
        return text ? text.length * 10 + 20 : 20
    }),
}))

describe('<TextInput />', () => {
    const minProps: ComponentProps<typeof TextInput> = {
        className: 'class-for-wrapper',
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an enabled input', () => {
        const { container } = render(<TextInput {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a disabled input', () => {
        const { container } = render(<TextInput {...minProps} isDisabled />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a required input', () => {
        const { container } = render(<TextInput {...minProps} isRequired />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a custom className for the input', () => {
        const { container } = render(
            <TextInput {...minProps} inputClassName="custom-class-for-input" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an input with error state', () => {
        const { container } = render(<TextInput {...minProps} hasError />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call `onChange` when updating the input value', () => {
        const { container } = render(<TextInput {...minProps} />)

        fireEvent.change(container.querySelector('input') as Element, {
            target: { value: '1.00' },
        })
        expect(minProps.onChange).toHaveBeenCalledWith('1.00')
    })

    it('should render prefix and suffix', () => {
        const screen = render(
            <TextInput
                prefix={<span>Prefix</span>}
                suffix={<span>Suffix</span>}
            />,
        )

        expect(screen.getByText('Prefix')).toBeInTheDocument()
        expect(screen.getByText('Suffix')).toBeInTheDocument()
    })

    it('should be disabled when isDisabled is true', () => {
        const screen = render(<TextInput isDisabled />)

        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
    })

    it('should clear text when clear icon is clicked', () => {
        const handleChange = jest.fn()
        const screen = render(
            <TextInput
                withClearText
                onChange={handleChange}
                value="Test value"
            />,
        )

        const clearButton = screen.getByRole('button')
        fireEvent.click(clearButton)

        expect(handleChange).toHaveBeenCalledWith('')
    })

    it('should focus input when prefix or suffix is clicked', () => {
        const screen = render(
            <TextInput
                prefix={<span>Prefix</span>}
                suffix={<span>Suffix</span>}
            />,
        )

        const input = screen.getByRole('textbox')
        const prefix = screen.getByText('Prefix')
        const suffix = screen.getByText('Suffix')

        fireEvent.click(prefix)
        expect(document.activeElement).toBe(input)

        fireEvent.click(suffix)
        expect(document.activeElement).toBe(input)
    })

    describe('resizable behavior', () => {
        it('should apply resizable CSS classes when isResizable is true', () => {
            const { container } = render(
                <TextInput {...minProps} isResizable value="Test text" />,
            )

            const wrapper = container.firstChild as HTMLElement
            const input = container.querySelector('input') as HTMLInputElement

            expect(wrapper).toHaveClass('isResizable')
            expect(input).toHaveClass('isResizable')
        })

        it('should not apply resizable CSS classes when isResizable is false', () => {
            const { container } = render(
                <TextInput
                    {...minProps}
                    isResizable={false}
                    value="Test text"
                />,
            )

            const wrapper = container.firstChild as HTMLElement
            const input = container.querySelector('input') as HTMLInputElement

            expect(wrapper).not.toHaveClass('isResizable')
            expect(input).not.toHaveClass('isResizable')
        })

        it('should apply dynamic width based on text content when resizable and maxWidth is provided', () => {
            const { container } = render(
                <TextInput
                    {...minProps}
                    isResizable
                    maxWidth={200}
                    value="Hello"
                />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            // "Hello" = 5 chars * 10px + 20px base = 70px (under maxWidth of 200px)
            expect(input.style.width).toBe('70px')
        })

        it('should update width when text content changes with maxWidth', async () => {
            const handleChange = jest.fn()

            const { container, rerender } = render(
                <TextInput
                    {...minProps}
                    isResizable
                    maxWidth={300}
                    onChange={handleChange}
                    value="Hi"
                />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            // "Hi" = 2 chars * 10px + 20px base = 40px
            expect(input.style.width).toBe('40px')

            // Simulate longer text
            rerender(
                <TextInput
                    {...minProps}
                    isResizable
                    maxWidth={300}
                    onChange={handleChange}
                    value="This is a longer text"
                />,
            )

            // "This is a longer text" = 21 chars * 10px + 20px base = 230px
            expect(input.style.width).toBe('230px')
        })

        it('should respect maxWidth constraint when provided', () => {
            const { container } = render(
                <TextInput
                    {...minProps}
                    isResizable
                    maxWidth={100}
                    value="This is a very long text that should be constrained"
                />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            // Text would be 540px (52 chars * 10 + 20) but maxWidth is 100px
            expect(input.style.width).toBe('100px')
        })

        it('should use calculated width when text is shorter than maxWidth', () => {
            const { container } = render(
                <TextInput
                    {...minProps}
                    isResizable
                    maxWidth={200}
                    value="Short"
                />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            // "Short" = 5 chars * 10px + 20px base = 70px (under maxWidth of 200px)
            expect(input.style.width).toBe('70px')
        })

        it('should not apply width style when isResizable is false', () => {
            const { container } = render(
                <TextInput
                    {...minProps}
                    isResizable={false}
                    value="Some text"
                />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            expect(input.style.width).toBe('')
        })

        it('should not apply width style when isResizable is false even with maxWidth', () => {
            const { container } = render(
                <TextInput
                    {...minProps}
                    isResizable={false}
                    maxWidth={100}
                    value="Some text"
                />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            expect(input.style.width).toBe('')
        })

        it('should handle empty value when resizable with maxWidth', () => {
            const { container } = render(
                <TextInput {...minProps} isResizable maxWidth={100} value="" />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            // Empty string should return base width (20px from mock)
            expect(input.style.width).toBe('20px')
        })

        it('should handle undefined value when resizable with maxWidth', () => {
            const { container } = render(
                <TextInput {...minProps} isResizable maxWidth={100} />,
            )

            const input = container.querySelector('input') as HTMLInputElement
            // Undefined value should be converted to empty string and return base width
            expect(input.style.width).toBe('20px')
        })
    })
})
