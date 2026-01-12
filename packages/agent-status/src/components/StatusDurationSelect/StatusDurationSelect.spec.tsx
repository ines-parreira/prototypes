import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DURATION_OPTIONS } from '../../constants'
import { render } from '../../tests/render.utils'
import { StatusDurationSelect } from './StatusDurationSelect'

/**
 * Helper to get the hidden select element used by Axiom's Select component
 * Axiom Select uses React Aria which renders a hidden native select for accessibility
 */
function getDurationSelect() {
    const container = screen.getByTestId('hidden-select-container')
    return container.querySelector('select')!
}

describe('StatusDurationSelect', () => {
    const defaultProps = {
        value: DURATION_OPTIONS[0], // Unlimited
        onChange: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render duration label', () => {
            render(<StatusDurationSelect {...defaultProps} />)

            expect(screen.getByText('Status duration')).toBeInTheDocument()
        })

        it('should display selected duration', () => {
            render(<StatusDurationSelect {...defaultProps} />)

            const unlimitedElements = screen.getAllByText('Unlimited')
            expect(unlimitedElements.length).toBeGreaterThan(0)
        })

        it('should display different selected duration', () => {
            render(
                <StatusDurationSelect
                    {...defaultProps}
                    value={DURATION_OPTIONS[1]} // 15 minutes
                />,
            )

            const elements = screen.getAllByText('15 minutes')
            expect(elements.length).toBeGreaterThan(0)
        })
    })

    describe('Dropdown Interactions', () => {
        it('should show all duration options', () => {
            render(<StatusDurationSelect {...defaultProps} />)

            const select = getDurationSelect()
            const options = select.querySelectorAll('option')

            expect(options.length).toBeGreaterThanOrEqual(
                DURATION_OPTIONS.length,
            )
        })

        it('should call onChange when an option is selected', async () => {
            const onChange = vi.fn()
            const { user } = render(
                <StatusDurationSelect {...defaultProps} onChange={onChange} />,
            )

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '30-minutes'))

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: '30 minutes',
                    id: '30-minutes',
                    unit: 'minutes',
                    value: 30,
                }),
            )
        })

        it('should select Unlimited option', async () => {
            const onChange = vi.fn()
            const { user } = render(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[1]}
                    onChange={onChange}
                />,
            )

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, 'unlimited'))

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Unlimited',
                    id: 'unlimited',
                    value: null,
                }),
            )
        })

        it('should select 15 minutes option', async () => {
            const onChange = vi.fn()
            const { user } = render(
                <StatusDurationSelect {...defaultProps} onChange={onChange} />,
            )

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '15-minutes'))

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: '15 minutes',
                    id: '15-minutes',
                    unit: 'minutes',
                    value: 15,
                }),
            )
        })
    })

    describe('Controlled Component Behavior', () => {
        it('should update displayed value when value prop changes', () => {
            const { rerender } = render(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[0]}
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getAllByText('Unlimited').length).toBeGreaterThan(0)

            rerender(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[2]} // 30 minutes
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getAllByText('30 minutes').length).toBeGreaterThan(0)
        })

        it('should reflect all duration options correctly', () => {
            DURATION_OPTIONS.forEach((option) => {
                const { unmount } = render(
                    <StatusDurationSelect value={option} onChange={vi.fn()} />,
                )

                expect(screen.getAllByText(option.name).length).toBeGreaterThan(
                    0,
                )

                unmount()
            })
        })
    })

    describe('Edge Cases', () => {
        it('should handle null duration value correctly', () => {
            render(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[0]} // Unlimited = null
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getAllByText('Unlimited').length).toBeGreaterThan(0)
        })

        it('should handle numeric duration values correctly', () => {
            const durations = DURATION_OPTIONS.slice(1) // Skip Unlimited

            durations.forEach((duration) => {
                const { unmount } = render(
                    <StatusDurationSelect
                        value={duration}
                        onChange={vi.fn()}
                    />,
                )

                expect(
                    screen.getAllByText(duration.name).length,
                ).toBeGreaterThan(0)

                unmount()
            })
        })
    })

    describe('Accessibility', () => {
        it('should have descriptive label text', () => {
            render(<StatusDurationSelect {...defaultProps} />)

            expect(screen.getByText('Status duration')).toBeInTheDocument()
        })

        it('should have proper list item structure for options', () => {
            render(<StatusDurationSelect {...defaultProps} />)

            const select = getDurationSelect()
            const options = select.querySelectorAll('option')

            expect(options.length).toBeGreaterThanOrEqual(
                DURATION_OPTIONS.length,
            )
        })

        it('should support custom aria-label', () => {
            render(
                <StatusDurationSelect
                    {...defaultProps}
                    aria-label="Select status duration"
                />,
            )

            // The component should still render with custom aria-label
            expect(screen.getByText('Status duration')).toBeInTheDocument()
        })
    })

    describe('Error Display', () => {
        it('should display error message when error prop is provided', () => {
            render(
                <StatusDurationSelect
                    {...defaultProps}
                    error="Duration is required"
                />,
            )

            expect(screen.getByText('Duration is required')).toBeInTheDocument()
        })

        it('should not display error when error prop is undefined', () => {
            render(<StatusDurationSelect {...defaultProps} />)

            expect(
                screen.queryByText('Duration is required'),
            ).not.toBeInTheDocument()
        })
    })

    describe('FormField Integration', () => {
        it('should work with value/onChange props', async () => {
            const onChange = vi.fn()
            const { user } = render(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[0]}
                    onChange={onChange}
                />,
            )

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '30-minutes'))

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: '30 minutes',
                    id: '30-minutes',
                    unit: 'minutes',
                    value: 30,
                }),
            )
        })

        it('should render with value prop showing correct selection', () => {
            render(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[1]}
                    onChange={vi.fn()}
                />,
            )

            const elements = screen.getAllByText('15 minutes')
            expect(elements.length).toBeGreaterThan(0)
        })

        it('should call onChange when duration is selected', async () => {
            const onChange = vi.fn()
            const { user } = render(
                <StatusDurationSelect
                    value={DURATION_OPTIONS[0]}
                    onChange={onChange}
                />,
            )

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '1-hour'))

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: '1 hour',
                    id: '1-hour',
                    unit: 'hours',
                    value: 1,
                }),
            )
        })
    })
})
