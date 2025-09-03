import { render, screen } from '@testing-library/react'

import { TimeFrameSelector } from '../TimeFrameSelector'

jest.mock('pages/common/forms/DatePicker', () => {
    return function MockDatePicker(props: any) {
        return (
            <div data-testid="mock-date-picker">
                <div data-testid="picker-props">
                    {JSON.stringify({
                        isOpen: props.isOpen,
                        rangesLabel: props.rangesLabel,
                        unavailableDateMessage: props.unavailableDateMessage,
                        hasRanges: !!props.initialSettings?.ranges,
                        rangeCount: props.initialSettings?.ranges
                            ? Object.keys(props.initialSettings.ranges).length
                            : 0,
                        minDate:
                            props.initialSettings?.minDate?.format(
                                'YYYY-MM-DD',
                            ),
                        maxDate:
                            props.initialSettings?.maxDate?.format(
                                'YYYY-MM-DD',
                            ),
                        timePicker: props.initialSettings?.timePicker,
                        singleDatePicker:
                            props.initialSettings?.singleDatePicker,
                        opens: props.initialSettings?.opens,
                        hasOnHide: typeof props.onHide === 'function',
                        hasOnCancel: typeof props.onCancel === 'function',
                        hasOnClear: typeof props.onClear === 'function',
                    })}
                </div>
                <button
                    data-testid="trigger-onHide"
                    onClick={() => props.onHide?.()}
                >
                    Hide
                </button>
                <button
                    data-testid="trigger-onCancel"
                    onClick={() => props.onCancel?.()}
                >
                    Cancel
                </button>
                <button
                    data-testid="trigger-onClear"
                    onClick={() => props.onClear?.()}
                >
                    Clear
                </button>
                {props.children}
            </div>
        )
    }
})

describe('TimeFrameSelector', () => {
    const mockOnSubmit = jest.fn()
    const mockOnCancel = jest.fn()
    const mockToggle = jest.fn()

    const defaultProps = {
        onSubmit: mockOnSubmit,
        onCancel: mockOnCancel,
        isOpen: false,
        toggle: mockToggle,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-06-15T12:00:00Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Component Rendering', () => {
        it('renders DatePicker with correct props when closed', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument()

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData).toMatchObject({
                isOpen: false,
                rangesLabel: 'Import timeframe',
                unavailableDateMessage:
                    'You can only select date ranges from the past 2 years up to today.',
                hasRanges: true,
                rangeCount: 3,
                timePicker: false,
                singleDatePicker: false,
                opens: 'center',
            })
        })

        it('renders DatePicker with isOpen true when open', () => {
            render(<TimeFrameSelector {...defaultProps} isOpen={true} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.isOpen).toBe(true)
        })

        it('renders children inside DatePicker', () => {
            render(
                <TimeFrameSelector {...defaultProps}>
                    <button>Select timeframe</button>
                </TimeFrameSelector>,
            )

            expect(screen.getByText('Select timeframe')).toBeInTheDocument()
        })
    })

    describe('Date Range Configuration', () => {
        it('sets correct date boundaries', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.minDate).toBe('2022-06-15')
            expect(propsData.maxDate).toBe('2024-06-15')
        })

        it('configures DatePicker with correct settings', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData).toMatchObject({
                timePicker: false,
                singleDatePicker: false,
                opens: 'center',
                hasRanges: true,
                rangeCount: 3,
            })
        })
    })

    describe('Date Range Calculations', () => {
        it('creates correct date ranges for preset options', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.rangeCount).toBe(3)
        })
    })

    describe('Props Handling', () => {
        it('passes onSubmit prop to DatePicker', () => {
            const customOnSubmit = jest.fn()
            render(
                <TimeFrameSelector
                    {...defaultProps}
                    onSubmit={customOnSubmit}
                />,
            )

            expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument()
        })

        it('passes toggle prop to DatePicker', () => {
            const customToggle = jest.fn()
            render(
                <TimeFrameSelector {...defaultProps} toggle={customToggle} />,
            )

            expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument()
        })

        it('handles missing toggle prop gracefully', () => {
            const propsWithoutToggle = {
                onSubmit: mockOnSubmit,
                onCancel: mockOnCancel,
                isOpen: true,
            }

            expect(() => {
                render(<TimeFrameSelector {...propsWithoutToggle} />)
            }).not.toThrow()
        })
    })

    describe('Component Labels and Messages', () => {
        it('sets correct ranges label', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.rangesLabel).toBe('Import timeframe')
        })

        it('sets correct unavailable date message', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.unavailableDateMessage).toBe(
                'You can only select date ranges from the past 2 years up to today.',
            )
        })
    })

    describe('Edge Cases', () => {
        it('handles different system dates correctly', () => {
            jest.setSystemTime(new Date('2023-12-25T12:00:00Z'))

            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.minDate).toBe('2021-12-25')
            expect(propsData.maxDate).toBe('2023-12-25')
        })

        it('renders without children', () => {
            expect(() => {
                render(<TimeFrameSelector {...defaultProps} />)
            }).not.toThrow()

            expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument()
        })
    })

    describe('Integration with DatePicker', () => {
        it('passes all required props to DatePicker', () => {
            render(
                <TimeFrameSelector {...defaultProps} isOpen={true}>
                    <div>Test child</div>
                </TimeFrameSelector>,
            )

            const datePickerElement = screen.getByTestId('mock-date-picker')
            expect(datePickerElement).toBeInTheDocument()

            expect(screen.getByText('Test child')).toBeInTheDocument()

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData).toMatchObject({
                isOpen: true,
                rangesLabel: 'Import timeframe',
                unavailableDateMessage:
                    'You can only select date ranges from the past 2 years up to today.',
                hasRanges: true,
                rangeCount: 3,
                timePicker: false,
                singleDatePicker: false,
                opens: 'center',
            })
        })
    })

    describe('Clear functionality', () => {
        it('calls onCancel when clear is triggered', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            expect(mockOnCancel).toHaveBeenCalledTimes(0)

            defaultProps.onCancel()

            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        })

        it('requires onCancel prop to be provided', () => {
            expect(defaultProps.onCancel).toBeDefined()
            expect(typeof defaultProps.onCancel).toBe('function')
        })
    })

    describe('Close event handlers', () => {
        it('passes onHide, onCancel, and onClear handlers to DatePicker', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const propsData = JSON.parse(
                screen.getByTestId('picker-props').textContent || '{}',
            )

            expect(propsData.hasOnHide).toBe(true)
            expect(propsData.hasOnCancel).toBe(true)
            expect(propsData.hasOnClear).toBe(true)
        })

        it('calls onSubmit and onCancel when onHide is triggered', () => {
            render(<TimeFrameSelector {...defaultProps} />)

            const hideButton = screen.getByTestId('trigger-onHide')
            hideButton.click()

            expect(mockOnSubmit).toHaveBeenCalledTimes(1)
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        })

        it('calls onSubmit and onCancel when onCancel handler is triggered', () => {
            mockOnSubmit.mockClear()
            mockOnCancel.mockClear()

            render(<TimeFrameSelector {...defaultProps} />)

            const cancelButton = screen.getByTestId('trigger-onCancel')
            cancelButton.click()

            expect(mockOnSubmit).toHaveBeenCalledTimes(1)
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        })

        it('calls onSubmit and onCancel when onClear is triggered', () => {
            mockOnSubmit.mockClear()
            mockOnCancel.mockClear()

            render(<TimeFrameSelector {...defaultProps} />)

            const clearButton = screen.getByTestId('trigger-onClear')
            clearButton.click()

            expect(mockOnSubmit).toHaveBeenCalledTimes(1)
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        })

        it('all close handlers use the same handleClear function', () => {
            mockOnSubmit.mockClear()
            mockOnCancel.mockClear()

            render(<TimeFrameSelector {...defaultProps} />)

            const hideButton = screen.getByTestId('trigger-onHide')
            const cancelButton = screen.getByTestId('trigger-onCancel')
            const clearButton = screen.getByTestId('trigger-onClear')

            hideButton.click()
            const firstCallArgs = mockOnSubmit.mock.calls[0]

            mockOnSubmit.mockClear()
            cancelButton.click()
            const secondCallArgs = mockOnSubmit.mock.calls[0]

            mockOnSubmit.mockClear()
            clearButton.click()
            const thirdCallArgs = mockOnSubmit.mock.calls[0]

            expect(firstCallArgs).toEqual(secondCallArgs)
            expect(secondCallArgs).toEqual(thirdCallArgs)
        })
    })
})
