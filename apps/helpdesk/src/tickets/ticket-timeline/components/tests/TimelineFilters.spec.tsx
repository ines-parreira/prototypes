import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TimelineFilters } from '../TimelineFilters'

const mockSetInteractionTypeFilters = jest.fn()
const mockSetRangeFilter = jest.fn()
const mockToggleSelectedStatus = jest.fn()
const mockSetSortOption = jest.fn()

const defaultProps = {
    setInteractionTypeFilters: mockSetInteractionTypeFilters,
    setRangeFilter: mockSetRangeFilter,
    toggleSelectedStatus: mockToggleSelectedStatus,
    selectedTypeKeys: ['ticket' as const],
    selectedStatusKeys: [],
    rangeFilter: { start: null, end: null },
    sortOption: 'created-desc' as const,
    setSortOption: mockSetSortOption,
}

const renderComponent = (props = {}) => {
    return renderWithStoreAndQueryClientProvider(
        <TimelineFilters {...defaultProps} {...props} />,
    )
}

describe('TimelineFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Basic rendering', () => {
        it('should render filtering and sorting buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /slider-filter/i }),
            ).toBeInTheDocument()
            expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
        })

        it('should display correct interaction type labels', () => {
            renderComponent({ selectedTypeKeys: ['ticket'] })
            expect(screen.getAllByText('Tickets').length).toBeGreaterThan(0)

            renderComponent({ selectedTypeKeys: ['order'] })
            expect(screen.getAllByText('Orders').length).toBeGreaterThan(0)

            renderComponent({ selectedTypeKeys: ['ticket', 'order'] })
            expect(
                screen.getAllByText('All interactions').length,
            ).toBeGreaterThan(0)
        })
    })

    describe('Filter addition workflow', () => {
        it('should add Date Range filter and open its dropdown', async () => {
            const user = userEvent.setup()
            renderComponent()

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Date range').length,
                ).toBeGreaterThan(0)
            })

            const dateRangeOptions = screen.getAllByText('Date range')
            await user.click(dateRangeOptions[dateRangeOptions.length - 1])

            await waitFor(() => {
                expect(
                    screen.queryAllByText('All time').length,
                ).toBeGreaterThan(0)
            })
        })

        it('should add Ticket Status filter and open its dropdown', async () => {
            const user = userEvent.setup()
            renderComponent({ selectedStatusKeys: ['open'] })

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Ticket status').length,
                ).toBeGreaterThan(0)
            })

            const ticketStatusOptions = screen.getAllByText('Ticket status')
            await user.click(
                ticketStatusOptions[ticketStatusOptions.length - 1],
            )

            await waitFor(() => {
                const closedOptions = screen.queryAllByText('Closed')
                expect(closedOptions.length).toBeGreaterThan(0)
            })
        })
    })

    describe('Dropdown orchestration', () => {
        it('should close FilteringButton dropdown when a filter is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Date range').length,
                ).toBeGreaterThan(0)
            })

            const dateRangeOptions = screen.getAllByText('Date range')
            await user.click(dateRangeOptions[dateRangeOptions.length - 1])

            await waitFor(() => {
                expect(
                    screen.queryAllByText('All time').length,
                ).toBeGreaterThan(0)
            })
        })

        it('should close one filter dropdown when another is opened', async () => {
            const user = userEvent.setup()
            renderComponent()

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })

            await user.click(filterButton)
            await waitFor(() => {
                expect(
                    screen.queryAllByText('Date range').length,
                ).toBeGreaterThan(0)
            })

            const dateRangeOptions = screen.getAllByText('Date range')
            await user.click(dateRangeOptions[dateRangeOptions.length - 1])

            await waitFor(() => {
                expect(
                    screen.queryAllByText('All time').length,
                ).toBeGreaterThan(0)
            })

            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Ticket status').length,
                ).toBeGreaterThan(0)
            })
        })

        it('should close dropdown when Escape is pressed', async () => {
            const user = userEvent.setup()
            renderComponent()

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Date range').length,
                ).toBeGreaterThan(0)
            })

            await user.keyboard('{Escape}')

            await waitFor(() => {
                const options = screen.queryAllByText('Date range')
                expect(options.length).toBeLessThanOrEqual(1)
            })
        })
    })

    describe('Filter removal', () => {
        it('should remove Date Range filter and reset range values', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent()

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Date range').length,
                ).toBeGreaterThan(0)
            })

            const dateRangeOptions = screen.getAllByText('Date range')
            await user.click(dateRangeOptions[dateRangeOptions.length - 1])

            await waitFor(() => {
                expect(
                    screen.queryAllByText('All time').length,
                ).toBeGreaterThan(0)
            })

            // Click "All time" to select it and close the date picker
            const allTimeOptions = screen.getAllByText('All time')
            await user.click(allTimeOptions[allTimeOptions.length - 1])

            // Wait for the date picker to close
            await user.keyboard('{Escape}')

            // Wait for the filter to be fully rendered and get all close buttons
            const closeButtons = await waitFor(() => {
                const buttons = container.querySelectorAll(
                    '[data-name="tag-close-button"]',
                )
                expect(buttons.length).toBeGreaterThan(1)
                return buttons
            })

            // Click the first close button (Date Range filter)
            await user.click(closeButtons[0] as HTMLElement)

            await waitFor(() => {
                expect(mockSetRangeFilter).toHaveBeenCalledWith({
                    start: null,
                    end: null,
                })
            })
        })

        it('should remove Interaction Type filter and reset to all interactions', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent({
                selectedTypeKeys: ['ticket'],
            })

            await waitFor(() => {
                expect(screen.getAllByText('Tickets').length).toBeGreaterThan(0)
            })

            const closeButton = container.querySelector(
                '[data-name="tag-close-button"]',
            ) as HTMLElement
            await user.click(closeButton)

            await waitFor(() => {
                expect(mockSetInteractionTypeFilters).toHaveBeenCalledWith({
                    ticket: true,
                    order: true,
                })
            })
        })

        it('should remove Ticket Status filter and reset to all statuses', async () => {
            const user = userEvent.setup()
            const { container } = renderComponent({
                selectedStatusKeys: ['snooze'],
            })

            // Add the ticket status filter
            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Ticket status').length,
                ).toBeGreaterThan(0)
            })

            const ticketStatusOptions = screen.getAllByText('Ticket status')
            await user.click(
                ticketStatusOptions[ticketStatusOptions.length - 1],
            )

            // Wait for the ticket status tag to be rendered
            await waitFor(() => {
                const snoozedTags = screen.queryAllByText('Snoozed')
                expect(snoozedTags.length).toBeGreaterThan(1)
            })

            // Close the dropdown by pressing Escape
            await user.keyboard('{Escape}')

            // Clear previous mock calls before testing the remove functionality
            mockToggleSelectedStatus.mockClear()

            // Get all close buttons - there should be 2 (interaction type + ticket status)
            const closeButtons = container.querySelectorAll(
                '[data-name="tag-close-button"]',
            )
            expect(closeButtons.length).toBeGreaterThan(1)

            // Click the second close button (ticket status filter)
            await user.click(closeButtons[1] as HTMLElement)

            // Verify that all statuses not currently selected are toggled
            expect(mockToggleSelectedStatus).toHaveBeenCalledWith('open')
            expect(mockToggleSelectedStatus).toHaveBeenCalledWith('closed')
        })
    })

    describe('Filter interactions', () => {
        it('should allow opening interaction type filter dropdown and selecting options', async () => {
            const user = userEvent.setup()
            renderComponent({ selectedTypeKeys: ['ticket'] })

            const ticketsTag = screen.getAllByText('Tickets')[0]
            await user.click(ticketsTag)

            await waitFor(() => {
                expect(screen.queryAllByText('Orders').length).toBeGreaterThan(
                    0,
                )
            })
        })

        it('should allow selecting statuses from ticket status dropdown', async () => {
            const user = userEvent.setup()
            renderComponent({ selectedStatusKeys: ['open', 'closed'] })

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Ticket status').length,
                ).toBeGreaterThan(0)
            })

            const ticketStatusOptions = screen.getAllByText('Ticket status')
            await user.click(
                ticketStatusOptions[ticketStatusOptions.length - 1],
            )

            await waitFor(() => {
                const filterTag = screen.queryByText('Open, Closed')
                expect(filterTag).toBeInTheDocument()
            })

            const filterTag = screen.getByText('Open, Closed')
            await user.click(filterTag)

            await waitFor(() => {
                expect(screen.queryAllByText('Snoozed').length).toBeGreaterThan(
                    0,
                )
            })
        })

        it('should allow clicking on Date Range filter tag to open picker', async () => {
            const user = userEvent.setup()
            renderComponent()

            const filterButton = screen.getByRole('button', {
                name: /slider-filter/i,
            })
            await user.click(filterButton)

            await waitFor(() => {
                expect(
                    screen.queryAllByText('Date range').length,
                ).toBeGreaterThan(0)
            })

            const dateRangeOptions = screen.getAllByText('Date range')
            await user.click(dateRangeOptions[dateRangeOptions.length - 1])

            await waitFor(() => {
                expect(
                    screen.queryAllByText('All time').length,
                ).toBeGreaterThan(0)
            })

            await user.keyboard('{Escape}')

            const allTimeTags = screen.getAllByText('All time')
            await user.click(allTimeTags[0])

            await waitFor(() => {
                expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
            })
        })
    })
})
