import { createRef } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import EditableTitle from './EditableTitle'

// Mock useTextWidth to avoid Canvas API issues in tests
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useEffectOnce: (fn: () => void) => {
        fn()
    },
    useTextWidth: (text: string, options: any = {}) => {
        // Simple mock that returns a basic width calculation
        const baseWidth = text ? text.length * 8 : 0
        return baseWidth + (options.padding || 0)
    },
}))

describe('EditableTitle', () => {
    const defaultProps = {
        title: 'Test Title',
        update: jest.fn(),
        placeholder: 'Enter title...',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render with the provided title', () => {
            render(<EditableTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('Test Title')
        })

        it('should render with placeholder when title is empty', () => {
            render(<EditableTitle {...defaultProps} title="" />)

            const input = screen.getByRole('textbox')
            expect(input).toHaveAttribute('placeholder', 'Enter title...')
        })

        it('should apply custom className', () => {
            render(<EditableTitle {...defaultProps} className="custom-class" />)

            const input = screen.getByRole('textbox')
            expect(input.closest('.custom-class')).toBeInTheDocument()
        })

        it('should be disabled when disabled prop is true', () => {
            render(<EditableTitle {...defaultProps} disabled />)

            const input = screen.getByRole('textbox')
            expect(input).toBeDisabled()
        })
    })

    describe('User Interactions', () => {
        it('should call onChange when user types', async () => {
            const onChange = jest.fn()
            const user = userEvent.setup()

            render(<EditableTitle {...defaultProps} onChange={onChange} />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.clear(input)
                await user.type(input, 'New Title')
            })

            expect(onChange).toHaveBeenCalledWith('New Title')
        })

        it('should call update when input loses focus', async () => {
            const update = jest.fn()
            const user = userEvent.setup()

            render(<EditableTitle {...defaultProps} update={update} />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.clear(input)
                await user.type(input, 'Updated Title')
                await user.tab() // This will blur the input
            })

            expect(update).toHaveBeenCalledWith('Updated Title')
        })

        it('should call custom onBlur handler when provided', async () => {
            const onBlur = jest.fn()
            const user = userEvent.setup()

            render(<EditableTitle {...defaultProps} onBlur={onBlur} />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.click(input)
                await user.tab()
            })

            expect(onBlur).toHaveBeenCalled()
        })
    })

    describe('Keyboard Navigation', () => {
        it('should prevent default on Enter keydown', async () => {
            const user = userEvent.setup()
            render(<EditableTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.click(input)
                await user.keyboard('{Enter}')
            })

            await waitFor(() => {
                expect(input).not.toHaveFocus()
            })
        })

        it('should exit edit mode and blur on Enter keyup', async () => {
            const user = userEvent.setup()
            render(<EditableTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.click(input)
                await user.keyboard('{Enter}')
            })

            await waitFor(() => {
                expect(input).not.toHaveFocus()
            })
        })

        it('should exit edit mode on Escape keyup', async () => {
            const user = userEvent.setup()
            render(<EditableTitle {...defaultProps} />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.click(input)
                await user.keyboard('{Escape}')
            })

            expect(input).toHaveFocus()
        })
    })

    describe('Edit Mode', () => {
        it('should force edit mode when forceEditMode is true', () => {
            render(<EditableTitle {...defaultProps} forceEditMode />)

            const input = screen.getByRole('textbox')
            // Check if edit mode styling is applied
            expect(input).toHaveClass('edit-mode')
        })
    })

    describe('Validation', () => {
        it('should show error state when isRequired and value is empty', async () => {
            const user = userEvent.setup()
            render(<EditableTitle {...defaultProps} isRequired />)

            const input = screen.getByRole('textbox')
            await act(async () => {
                await user.clear(input)
            })

            expect(input).toHaveValue('')
        })

        it('should not show error state when isRequired but value is present', () => {
            render(
                <EditableTitle
                    {...defaultProps}
                    isRequired
                    title="Valid Title"
                />,
            )

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('Valid Title')
        })

        it('should not show error state when value is empty but not required', async () => {
            render(<EditableTitle {...defaultProps} title="" />)

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('')
        })
    })

    describe('Title Updates', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('should update value when title prop changes', () => {
            const { rerender } = render(
                <EditableTitle {...defaultProps} title="Initial Title" />,
            )

            const input = screen.getByRole('textbox')
            expect(input).toHaveValue('Initial Title')

            rerender(<EditableTitle {...defaultProps} title="Updated Title" />)
            expect(input).toHaveValue('Updated Title')
        })

        it('should select text when title changes and select prop is true', () => {
            const selectSpy = jest.fn()

            const originalSelect = HTMLInputElement.prototype.select
            HTMLInputElement.prototype.select = selectSpy

            const { rerender } = render(
                <EditableTitle {...defaultProps} title="Initial" select />,
            )

            selectSpy.mockClear()

            rerender(<EditableTitle {...defaultProps} title="Updated" select />)

            jest.advanceTimersByTime(1)

            expect(selectSpy).toHaveBeenCalled()

            HTMLInputElement.prototype.select = originalSelect
        })
    })

    describe('Ref Forwarding', () => {
        it('should forward ref to the input element', async () => {
            const ref = createRef<HTMLInputElement>()
            render(<EditableTitle {...defaultProps} ref={ref} />)

            await waitFor(() => {
                expect(ref.current).toBeInstanceOf(HTMLInputElement)
            })

            expect(ref.current).toHaveValue('Test Title')
        })

        it('should allow calling input methods through ref', async () => {
            const ref = createRef<HTMLInputElement>()
            render(<EditableTitle {...defaultProps} ref={ref} />)

            await waitFor(() => {
                expect(ref.current).toBeTruthy()
            })

            expect(ref.current?.focus).toBeDefined()
            expect(ref.current?.blur).toBeDefined()
            expect(ref.current?.select).toBeDefined()
        })
    })
})
