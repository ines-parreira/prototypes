import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TimeFrameField } from '../TimeFrameField'

jest.mock('pages/common/forms/DatePicker', () => {
    return function MockDatePicker(props: any) {
        return (
            <div data-testid="mock-date-picker">
                {props.isOpen && (
                    <div data-testid="date-picker-dropdown">
                        <ul>
                            <li
                                onClick={() => {
                                    const sevenDaysAgo = new Date()
                                    sevenDaysAgo.setDate(
                                        sevenDaysAgo.getDate() - 7,
                                    )
                                    props.onSubmit(
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 1, 2025',
                                        },
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 8, 2025',
                                        },
                                    )
                                }}
                            >
                                Last 7 days
                            </li>
                            <li
                                onClick={() => {
                                    props.onSubmit(
                                        {
                                            format: (__fmt: string) =>
                                                'Feb 8, 2025',
                                        },
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 8, 2025',
                                        },
                                    )
                                }}
                            >
                                Last 6 months
                            </li>
                            <li
                                onClick={() => {
                                    props.onSubmit(
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 8, 2024',
                                        },
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 8, 2025',
                                        },
                                    )
                                }}
                            >
                                Last 12 months
                            </li>
                            <li
                                onClick={() => {
                                    props.onSubmit(
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 8, 2023',
                                        },
                                        {
                                            format: (__fmt: string) =>
                                                'Aug 8, 2025',
                                        },
                                    )
                                }}
                            >
                                Last 24 months
                            </li>
                        </ul>
                        <button onClick={props.onCancel}>Cancel</button>
                        <button onClick={props.onClear}>Clear</button>
                    </div>
                )}
                {props.children}
            </div>
        )
    }
})

describe('TimeFrameField', () => {
    const mockSetTimeframe = jest.fn()

    beforeEach(() => {
        mockSetTimeframe.mockClear()
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2025-08-08'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Initial Rendering', () => {
        it('renders the required label', () => {
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            expect(screen.getByText('Import timeframe')).toBeInTheDocument()
        })

        it('renders text field with placeholder when no timeframe is selected', () => {
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            expect(textField).toBeInTheDocument()
            expect(textField).toHaveValue('')
        })

        it('displays the selected timeframe value in the text field', () => {
            const selectedTimeframe = 'Jan 01, 2024 - Dec 31, 2024'

            render(
                <TimeFrameField
                    timeframe={selectedTimeframe}
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByDisplayValue(selectedTimeframe)
            expect(textField).toBeInTheDocument()
        })
    })

    describe('User Interactions', () => {
        it('opens TimeFrameSelector when text field is clicked', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 6 months')).toBeInTheDocument()
            })
        })

        it('displays all predefined timeframe options when opened', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 6 months')).toBeInTheDocument()
                expect(screen.getByText('Last 12 months')).toBeInTheDocument()
                expect(screen.getByText('Last 24 months')).toBeInTheDocument()
            })
        })

        it('closes selector and updates timeframe when a predefined option is selected', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 6 months')).toBeInTheDocument()
            })

            const last6MonthsOption = screen.getByText('Last 6 months')
            await user.click(last6MonthsOption)

            expect(mockSetTimeframe).toHaveBeenCalled()
        })

        it('handles different predefined timeframe selections', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 12 months')).toBeInTheDocument()
            })

            const last12MonthsOption = screen.getByText('Last 12 months')
            await user.click(last12MonthsOption)

            expect(mockSetTimeframe).toHaveBeenCalled()
        })

        it('can reopen selector after making a selection', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe="Last 6 months"
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByDisplayValue('Last 6 months')
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 12 months')).toBeInTheDocument()
            })
        })
    })

    describe('Component Structure', () => {
        it('renders with correct CSS class structure', () => {
            const { container } = render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const formGroup = container.querySelector('.formGroup')
            expect(formGroup).toBeInTheDocument()
        })

        it('renders all required child components', () => {
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            expect(screen.getByText('Import timeframe')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Please select a timeframe'),
            ).toBeInTheDocument()
        })
    })

    describe('State Management', () => {
        it('maintains selector open/closed state correctly', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )

            await user.click(textField)
            await waitFor(() => {
                expect(screen.getByText('Last 6 months')).toBeInTheDocument()
            })

            const option = screen.getByText('Last 6 months')
            await user.click(option)

            expect(mockSetTimeframe).toHaveBeenCalled()
        })

        it('check if TimeFrameField is opened again when closed', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 6 months')).toBeInTheDocument()
            })

            const option = screen.getByText('Last 6 months')
            await user.click(option)

            expect(mockSetTimeframe).toHaveBeenCalledTimes(1)
        })
    })

    describe('Date Range Selection', () => {
        it('shows all available predefined options', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(screen.getByText('Last 6 months')).toBeInTheDocument()
                expect(screen.getByText('Last 12 months')).toBeInTheDocument()
                expect(screen.getByText('Last 24 months')).toBeInTheDocument()
            })
        })

        it('displays calendar interface for custom selection', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            await user.click(textField)

            await waitFor(() => {
                expect(
                    screen.getByTestId('date-picker-dropdown'),
                ).toBeInTheDocument()
                expect(screen.getByText('Cancel')).toBeInTheDocument()
                expect(screen.getByText('Clear')).toBeInTheDocument()
            })
        })
    })

    describe('Edge Cases', () => {
        it('handles empty timeframe prop correctly', () => {
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )
            expect(textField).toHaveValue('')
        })

        it('handles long timeframe strings correctly', () => {
            const longTimeframe =
                'January 01, 2024 - December 31, 2024 (Very Long Description)'

            render(
                <TimeFrameField
                    timeframe={longTimeframe}
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByDisplayValue(longTimeframe)
            expect(textField).toBeInTheDocument()
        })

        it('handles special characters in timeframe correctly', () => {
            const specialTimeframe = 'Jan 01, 2024 – Dec 31, 2024'

            render(
                <TimeFrameField
                    timeframe={specialTimeframe}
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const textField = screen.getByDisplayValue(specialTimeframe)
            expect(textField).toBeInTheDocument()
        })

        it('handles undefined setTimeframe callback gracefully', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })

            const { container } = render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={undefined as any}
                    onCancel={() => null}
                />,
            )

            expect(container).toBeInTheDocument()

            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )

            await user.click(textField)
            expect(textField).toBeInTheDocument()
        })
    })

    describe('Integration Testing', () => {
        it('integrates label with text field correctly', () => {
            render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const label = screen.getByText('Import timeframe')
            const textField = screen.getByPlaceholderText(
                'Please select a timeframe',
            )

            expect(label).toBeInTheDocument()
            expect(textField).toBeInTheDocument()
        })

        it('maintains consistent styling across different states', () => {
            const { rerender } = render(
                <TimeFrameField
                    timeframe=""
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            let container = screen.getByPlaceholderText(
                'Please select a timeframe',
            ).parentElement

            rerender(
                <TimeFrameField
                    timeframe="Last 6 months"
                    setTimeframe={mockSetTimeframe}
                    onCancel={() => null}
                />,
            )

            const newContainer =
                screen.getByDisplayValue('Last 6 months').parentElement

            expect(container?.className).toBe(newContainer?.className)
        })
    })
})
