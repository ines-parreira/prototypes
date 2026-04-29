import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ReturnOrdersDrillDown } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/drillDowns/ReturnOrdersDrillDown'
import type { ReturnOrdersRow } from 'pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData'
import { useReturnOrdersDrillDownData } from 'pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData'

jest.mock('pages/aiAgent/analyticsOverview/hooks/useReturnOrdersDrillDownData')

const mockUseReturnOrdersDrillDownData = assumeMock(
    useReturnOrdersDrillDownData,
)

describe('ReturnOrdersDrillDown', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    const defaultRows: ReturnOrdersRow[] = [
        {
            Product: {
                image_url: 'https://cdn.example.com/a.png',
                name: 'Product A',
            },
            'Issues reported': 9,
            'Issues description': { reasonEditOrder: 4, reasonOther: 3 },
            'Return requests': 1,
        },
        {
            Product: {
                image_url: 'https://cdn.example.com/b.png',
                name: 'Product B',
            },
            'Issues reported': 4,
            'Issues description': { reasonOther: 1 },
            'Return requests': 0,
        },
    ]

    const renderComponent = ({
        count = defaultRows.length,
        isLoading = false,
        rows = defaultRows,
        isPeriodLimited = false,
    }: {
        count?: number
        isLoading?: boolean
        rows?: typeof defaultRows
        isPeriodLimited?: boolean
    } = {}) => {
        mockUseReturnOrdersDrillDownData.mockReturnValue({
            count,
            isLoading,
            rows,
            isPeriodLimited,
        })
        return render(<ReturnOrdersDrillDown />)
    }

    it('renders the trigger with the item count', () => {
        renderComponent({ count: 7 })

        expect(
            screen.getByRole('button', { name: /7 items/i }),
        ).toBeInTheDocument()
    })

    it('does not render the trigger when isLoading is true', () => {
        renderComponent({ isLoading: true, count: 5 })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not render the trigger when count is 0', () => {
        renderComponent({ count: 0 })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    describe('description', () => {
        it('shows the base description when the period is not limited', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: /2 items/i }))

            expect(
                screen.getByText(
                    'Top Products with most issues and return requests.',
                ),
            ).toBeInTheDocument()
        })

        it('shows the 90-day notice when the period is limited', async () => {
            const user = userEvent.setup()
            renderComponent({ isPeriodLimited: true })

            await user.click(screen.getByRole('button', { name: /2 items/i }))

            expect(
                screen.getByText(
                    'Top Products with most issues and return requests. Showing data for the latest 90 days in the selected period.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('does not render the side panel initially', () => {
        renderComponent()

        expect(screen.queryByText('Return orders')).not.toBeInTheDocument()
    })

    it('renders product names in the table when the panel is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /2 items/i }))

        expect(screen.getByText('Product A')).toBeInTheDocument()
        expect(screen.getByText('Product B')).toBeInTheDocument()
    })

    it('renders column headers when the panel is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /2 items/i }))

        expect(screen.getByText('Product')).toBeInTheDocument()
        expect(screen.getByText('Issues reported')).toBeInTheDocument()
        expect(screen.getByText('Return requests')).toBeInTheDocument()
        expect(screen.getByText('Issues description')).toBeInTheDocument()
    })

    describe('sorting', () => {
        const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
            await user.click(screen.getByRole('button', { name: /2 items/i }))
        }

        const getDataRows = () => {
            const [, ...dataRows] = screen.getAllByRole('row')
            return dataRows
        }

        it('sorts by Product name', async () => {
            const user = userEvent.setup()
            renderComponent()
            await openPanel(user)

            // first sort - ascending
            await user.click(
                screen.getByRole('columnheader', { name: /product/i }),
            )

            let rows = getDataRows()
            expect(within(rows[0]).getByText('Product A')).toBeInTheDocument()
            expect(within(rows[1]).getByText('Product B')).toBeInTheDocument()

            // second sort - descending
            await user.click(
                screen.getByRole('columnheader', { name: /product/i }),
            )

            rows = getDataRows()
            expect(within(rows[0]).getByText('Product B')).toBeInTheDocument()
            expect(within(rows[1]).getByText('Product A')).toBeInTheDocument()
        })

        it('sorts by Issues reported', async () => {
            const user = userEvent.setup()
            renderComponent()
            await openPanel(user)

            await user.click(
                screen.getByRole('columnheader', { name: /issues reported/i }),
            )

            // first sort - ascending
            let rows = getDataRows()
            expect(within(rows[0]).getByText('Product B')).toBeInTheDocument()
            expect(within(rows[1]).getByText('Product A')).toBeInTheDocument()

            // second sort - descending
            await user.click(
                screen.getByRole('columnheader', { name: /issues reported/i }),
            )

            rows = getDataRows()
            expect(within(rows[0]).getByText('Product A')).toBeInTheDocument()
            expect(within(rows[1]).getByText('Product B')).toBeInTheDocument()
        })

        it('sorts by Return requests', async () => {
            const user = userEvent.setup()
            renderComponent()
            await openPanel(user)

            await user.click(
                screen.getByRole('columnheader', {
                    name: /return requests/i,
                }),
            )

            let rows = getDataRows()
            expect(within(rows[0]).getByText('Product B')).toBeInTheDocument()
            expect(within(rows[1]).getByText('Product A')).toBeInTheDocument()
        })

        it('does not sort by Issues description', async () => {
            const user = userEvent.setup()
            renderComponent()
            await openPanel(user)

            await user.click(
                screen.getByRole('columnheader', {
                    name: /issues description/i,
                }),
            )

            const rows = getDataRows()
            expect(within(rows[0]).getByText('Product A')).toBeInTheDocument()
            expect(within(rows[1]).getByText('Product B')).toBeInTheDocument()
        })
    })
})
