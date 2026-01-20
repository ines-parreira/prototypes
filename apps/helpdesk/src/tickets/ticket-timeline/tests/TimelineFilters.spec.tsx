import { parseAbsolute } from '@internationalized/date'
import { act, screen } from '@testing-library/react'
import defaultUserEvent from '@testing-library/user-event'
import moment from 'moment'

import { renderWithStoreAndQueryClientProvider as render } from 'tests/renderWithStoreAndQueryClientProvider'
import { END_OF_TODAY_DATE, MIN_RANGE_DATE } from 'timeline/constants'
import type { FilterKey, InteractionFilterType, Range } from 'timeline/types'

import { TimelineFilters } from '../components/TimelineFilters'
import type { SortOption } from '../hooks/useTimelineData'

jest.mock('hooks/useGetDateAndTimeFormat', () => ({
    __esModule: true,
    default: jest.fn(() => 'MM/DD/YYYY'),
}))

// Store onChange handler globally so we can trigger it in tests
let dateRangePickerOnChange: ((value: any) => void) | null = null

// Mock DateRangePicker to allow us to test handleDateRangeChange
jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    return {
        ...actual,
        DateRangePicker: ({
            onChange,
            trigger,
        }: {
            onChange: (value: any) => void
            trigger: (props: any) => React.ReactElement
        }) => {
            // Store the onChange handler so tests can access it
            dateRangePickerOnChange = onChange
            return (
                <div data-testid="date-range-picker">{trigger({} as any)}</div>
            )
        },
    }
})

describe('TimelineFilters', () => {
    const mockSetInteractionTypeFilters = jest.fn()
    const mockSetRangeFilter = jest.fn()
    const mockToggleSelectedStatus = jest.fn()
    const mockSetSortOption = jest.fn()

    const defaultProps = {
        setInteractionTypeFilters: mockSetInteractionTypeFilters,
        setRangeFilter: mockSetRangeFilter,
        toggleSelectedStatus: mockToggleSelectedStatus,
        selectedTypeKeys: ['ticket', 'order'] as InteractionFilterType[],
        selectedStatusKeys: ['open', 'closed', 'snooze'] as FilterKey[],
        rangeFilter: { start: null, end: null } as Range,
        sortOption: 'updated-desc' as SortOption,
        setSortOption: mockSetSortOption,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('detectSelectedPreset function behavior', () => {
        it('should render without errors when today range is provided', () => {
            const now = moment()
            const todayStart = now.clone().startOf('day')
            const todayEnd = now.clone().endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: todayStart.valueOf(),
                    end: todayEnd.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors when yesterday range is provided', () => {
            const now = moment()
            const yesterdayStart = now.clone().subtract(1, 'day').startOf('day')
            const yesterdayEnd = now.clone().subtract(1, 'day').endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: yesterdayStart.valueOf(),
                    end: yesterdayEnd.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors for last 7 days preset range', () => {
            const now = moment()
            const start = now.clone().subtract(7, 'days').startOf('day')
            const end = now.clone().endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: start.valueOf(),
                    end: end.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors for last 30 days preset range', () => {
            const now = moment()
            const start = now.clone().subtract(30, 'days').startOf('day')
            const end = now.clone().endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: start.valueOf(),
                    end: end.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors for all time preset range', () => {
            const now = moment()
            const start = moment(MIN_RANGE_DATE).startOf('day')
            const end = now.clone().endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: start.valueOf(),
                    end: end.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors for custom date ranges', () => {
            const start = moment('2024-03-15').startOf('day')
            const end = moment('2024-03-20').endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: start.valueOf(),
                    end: end.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors when range is null (defaults to all time)', () => {
            const props = {
                ...defaultProps,
                rangeFilter: { start: null, end: null },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors with partial null range (start null)', () => {
            const now = moment()
            const end = now.clone().endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: null,
                    end: end.valueOf(),
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })

        it('should render without errors with partial null range (end null)', () => {
            const start = moment(MIN_RANGE_DATE).startOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: start.valueOf(),
                    end: null,
                },
            }

            const { container } = render(<TimelineFilters {...props} />)
            expect(container).toBeInTheDocument()
        })
    })

    describe('Filter components', () => {
        it('should display interaction type filter with "All interactions" label', () => {
            render(<TimelineFilters {...defaultProps} />)

            // The interaction type filter should display "All interactions"
            expect(screen.getByText('All interactions')).toBeInTheDocument()
        })

        it('should render filter components without errors', () => {
            const { container } = render(<TimelineFilters {...defaultProps} />)

            // Should render the component successfully
            expect(container).toBeInTheDocument()
        })
    })

    describe('handleDateRangeChange function', () => {
        beforeEach(() => {
            dateRangePickerOnChange = null
        })

        const activateDateRangeFilter = async () => {
            // Find the filter button (MultiSelect trigger)
            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await act(() => defaultUserEvent.click(filterButton))

            // Find and click "Date range" option
            const dateRangeOptions = await screen.findAllByText('Date range')
            // Click the last one (visible option in the list)
            await act(() =>
                defaultUserEvent.click(
                    dateRangeOptions[dateRangeOptions.length - 1],
                ),
            )

            // Wait a bit for the DateRangePicker to mount
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        it('should call setRangeFilter with null when newValue is null', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()

            if (!dateRangePickerOnChange) {
                throw new Error('DateRangePicker onChange handler not captured')
            }

            await act(() => dateRangePickerOnChange!(null))

            expect(mockSetRangeFilter).toHaveBeenCalledWith({
                start: null,
                end: null,
            })
        })

        it('should handle "today" preset correctly', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()
            const now = moment()
            await act(() =>
                dateRangePickerOnChange!({
                    start: parseAbsolute(
                        now.clone().startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        now.clone().endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )

            expect(mockSetRangeFilter).toHaveBeenCalled()
            const callArgs = mockSetRangeFilter.mock.calls[0][0]

            // Verify it's today's date
            const start = moment(callArgs.start)
            const end = moment(callArgs.end)

            expect(start.isSame(now, 'day')).toBe(true)
            expect(end.isSame(now, 'day')).toBe(true)
            expect(start.format('HH:mm:ss')).toBe('00:00:00')
            expect(end.format('HH:mm:ss')).toBe('23:59:59')
        })

        it('should handle "yesterday" preset correctly by adjusting end date', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()
            const now = moment()
            await act(() =>
                dateRangePickerOnChange!({
                    start: parseAbsolute(
                        now
                            .clone()
                            .subtract(1, 'day')
                            .startOf('day')
                            .toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        now.clone().endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )

            expect(mockSetRangeFilter).toHaveBeenCalled()
            const callArgs = mockSetRangeFilter.mock.calls[0][0]

            // Verify start is yesterday
            const yesterday = moment().subtract(1, 'day')
            const start = moment(callArgs.start)
            const end = moment(callArgs.end)

            expect(start.isSame(yesterday, 'day')).toBe(true)
            // End should also be yesterday (adjusted by the function)
            expect(end.isSame(yesterday, 'day')).toBe(true)
            expect(start.format('HH:mm:ss')).toBe('00:00:00')
            expect(end.format('HH:mm:ss')).toBe('23:59:59')
        })

        it('should handle custom date range correctly', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()
            await act(() =>
                dateRangePickerOnChange!({
                    start: parseAbsolute(
                        moment('2024-03-15').startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        moment('2024-03-20').endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )

            expect(mockSetRangeFilter).toHaveBeenCalled()
            const callArgs = mockSetRangeFilter.mock.calls[0][0]

            const start = moment(callArgs.start)
            const end = moment(callArgs.end)

            expect(start.format('YYYY-MM-DD HH:mm:ss')).toBe(
                '2024-03-15 00:00:00',
            )
            expect(end.format('YYYY-MM-DD HH:mm:ss')).toBe(
                '2024-03-20 23:59:59',
            )
        })

        it('should set rangeFilter to null when range equals MIN_RANGE_DATE to END_OF_TODAY_DATE', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()
            await act(() =>
                dateRangePickerOnChange!({
                    start: parseAbsolute(
                        moment(MIN_RANGE_DATE).startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        moment(END_OF_TODAY_DATE).toISOString(),
                        'UTC',
                    ),
                }),
            )

            expect(mockSetRangeFilter).toHaveBeenCalledWith({
                start: null,
                end: null,
            })
        })

        it('should convert ZonedDateTime to timestamps correctly', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()
            await act(() =>
                dateRangePickerOnChange!({
                    start: parseAbsolute(
                        moment('2024-03-15').startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        moment('2024-03-20').endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )

            expect(mockSetRangeFilter).toHaveBeenCalled()
            const callArgs = mockSetRangeFilter.mock.calls[0][0]

            // Verify we get timestamp numbers
            expect(typeof callArgs.start).toBe('number')
            expect(typeof callArgs.end).toBe('number')
            expect(callArgs.start).toBeGreaterThan(0)
            expect(callArgs.end).toBeGreaterThan(0)
            expect(callArgs.end).toBeGreaterThan(callArgs.start)
        })

        it('should convert start to startOf day and end to endOf day', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()
            await act(() =>
                dateRangePickerOnChange!({
                    start: parseAbsolute(
                        moment('2024-03-15').startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        moment('2024-03-20').endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )

            expect(mockSetRangeFilter).toHaveBeenCalled()
            const callArgs = mockSetRangeFilter.mock.calls[0][0]

            const start = moment(callArgs.start)
            const end = moment(callArgs.end)

            // Start should be at 00:00:00
            expect(start.hours()).toBe(0)
            expect(start.minutes()).toBe(0)
            expect(start.seconds()).toBe(0)

            // End should be at 23:59:59
            expect(end.hours()).toBe(23)
            expect(end.minutes()).toBe(59)
            expect(end.seconds()).toBe(59)
        })

        it('should handle multiple date changes sequentially', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await activateDateRangeFilter()

            if (!dateRangePickerOnChange) {
                throw new Error('DateRangePicker onChange handler not captured')
            }

            // Store the handler reference
            const onChange = dateRangePickerOnChange

            // First change - today
            const now = moment()
            await act(() =>
                onChange({
                    start: parseAbsolute(
                        now.clone().startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        now.clone().endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )
            expect(mockSetRangeFilter).toHaveBeenCalledTimes(1)

            // Second change - custom range
            await act(() =>
                onChange({
                    start: parseAbsolute(
                        moment('2024-03-15').startOf('day').toISOString(),
                        'UTC',
                    ),
                    end: parseAbsolute(
                        moment('2024-03-20').endOf('day').toISOString(),
                        'UTC',
                    ),
                }),
            )
            expect(mockSetRangeFilter).toHaveBeenCalledTimes(2)

            // Third change - clear
            await act(() => onChange(null))
            expect(mockSetRangeFilter).toHaveBeenCalledTimes(3)

            // Verify last call was with null
            expect(mockSetRangeFilter.mock.calls[2][0]).toEqual({
                start: null,
                end: null,
            })
        })
    })

    describe('handleRemoveFilter function', () => {
        it('should call setRangeFilter with null when dateRange filter is removed', async () => {
            const start = moment('2024-03-15').startOf('day')
            const end = moment('2024-03-20').endOf('day')

            const props = {
                ...defaultProps,
                rangeFilter: {
                    start: start.valueOf(),
                    end: end.valueOf(),
                },
            }

            render(<TimelineFilters {...props} />)

            await act(async () => {
                const filterButton = screen.getByRole('button', {
                    name: /slider-filter/i,
                })
                await defaultUserEvent.click(filterButton)

                const dateRangeOptions =
                    await screen.findAllByText('Date range')
                await defaultUserEvent.click(
                    dateRangeOptions[dateRangeOptions.length - 1],
                )
            })

            await new Promise((resolve) => setTimeout(resolve, 100))

            const allButtons = screen.getAllByRole('button')
            const closeButtons = allButtons.filter(
                (button) =>
                    button.getAttribute('aria-label') === 'close' ||
                    button.textContent?.includes('×'),
            )

            if (closeButtons.length > 0) {
                await act(() => defaultUserEvent.click(closeButtons[0]))

                expect(mockSetRangeFilter).toHaveBeenCalledWith({
                    start: null,
                    end: null,
                })
            }
        })

        it('should call setInteractionTypeFilters with all types when interactionType filter is removed', async () => {
            const props = {
                ...defaultProps,
                selectedTypeKeys: ['ticket'] as InteractionFilterType[],
            }

            render(<TimelineFilters {...props} />)

            const allButtons = screen.getAllByRole('button')
            const closeButtons = allButtons.filter(
                (button) =>
                    button.getAttribute('aria-label') === 'close' ||
                    button.textContent?.includes('×'),
            )

            if (closeButtons.length > 0) {
                await act(() => defaultUserEvent.click(closeButtons[0]))

                expect(mockSetInteractionTypeFilters).toHaveBeenCalledWith({
                    ticket: true,
                    order: true,
                })
            }
        })

        it('should remove ticketStatus filter from active filters when closed', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await act(async () => {
                const filterButton = screen.getByRole('button', {
                    name: /slider-filter/i,
                })
                await defaultUserEvent.click(filterButton)

                const ticketStatusOptions =
                    await screen.findAllByText('Ticket status')
                await defaultUserEvent.click(
                    ticketStatusOptions[ticketStatusOptions.length - 1],
                )
            })

            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(screen.getByText('All statuses')).toBeInTheDocument()

            const allButtons = screen.getAllByRole('button')
            const closeButtons = allButtons.filter(
                (button) =>
                    button.getAttribute('aria-label') === 'close' ||
                    button.textContent?.includes('×'),
            )

            const statusCloseButton = closeButtons.find((button) => {
                const container = button.closest(
                    '[data-name="overflow-list-item"]',
                )
                return container?.textContent?.includes('All statuses')
            })

            if (statusCloseButton) {
                await act(() => defaultUserEvent.click(statusCloseButton))

                await new Promise((resolve) => setTimeout(resolve, 100))

                expect(
                    screen.queryByText('All statuses'),
                ).not.toBeInTheDocument()
            }
        })
    })

    describe('getTicketStatusLabel function', () => {
        it('should not display ticket status filter by default (not in active filters)', () => {
            const props = {
                ...defaultProps,
                selectedStatusKeys: ['open', 'closed', 'snooze'] as FilterKey[],
            }

            render(<TimelineFilters {...props} />)

            expect(screen.queryByText('All statuses')).not.toBeInTheDocument()
        })

        it('should display "All statuses" when ticket status filter is activated with all options', async () => {
            render(<TimelineFilters {...defaultProps} />)

            await act(async () => {
                const filterButton = screen.getByRole('button', {
                    name: /slider-filter/i,
                })
                await defaultUserEvent.click(filterButton)

                const ticketStatusOptions =
                    await screen.findAllByText('Ticket status')
                await defaultUserEvent.click(
                    ticketStatusOptions[ticketStatusOptions.length - 1],
                )
            })

            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(screen.getByText('All statuses')).toBeInTheDocument()
        })

        it('should display comma-separated labels when multiple statuses are selected', async () => {
            const props = {
                ...defaultProps,
                selectedStatusKeys: ['open', 'closed'] as FilterKey[],
            }

            render(<TimelineFilters {...props} />)

            await act(async () => {
                const filterButton = screen.getByRole('button', {
                    name: /slider-filter/i,
                })
                await defaultUserEvent.click(filterButton)

                const ticketStatusOptions =
                    await screen.findAllByText('Ticket status')
                await defaultUserEvent.click(
                    ticketStatusOptions[ticketStatusOptions.length - 1],
                )
            })

            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(screen.getByText('Open, Closed')).toBeInTheDocument()
        })
    })
})
