import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TopReportedIssuesDrillDown } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/drillDowns/TopReportedIssuesDrillDown'
import type { TopReportedIssuesRow } from 'pages/aiAgent/analyticsOverview/hooks/useTopReportedIssuesDrillDownData'
import { useTopReportedIssuesDrillDownData } from 'pages/aiAgent/analyticsOverview/hooks/useTopReportedIssuesDrillDownData'

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useTopReportedIssuesDrillDownData',
)

const mockUseTopReportedIssuesDrillDownData = assumeMock(
    useTopReportedIssuesDrillDownData,
)

describe('TopReportedIssuesDrillDown', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    const defaultRows: TopReportedIssuesRow[] = [
        {
            Issue: 'Other',
            '% of issues reported': 53,
            'Tickets created': 141,
            Delta: -29,
        },
        {
            Issue: "I'd like to edit my order",
            '% of issues reported': 18,
            'Tickets created': 48,
            Delta: 9,
        },
    ]

    const renderComponent = ({
        count = defaultRows.length,
        isLoading = false,
        rows = defaultRows,
        isPeriodLimited = false,
        previousPeriod = 'Dec 1, 2023 - Dec 31, 2023',
    }: {
        count?: number
        isLoading?: boolean
        rows?: typeof defaultRows
        isPeriodLimited?: boolean
        previousPeriod?: string
    } = {}) => {
        mockUseTopReportedIssuesDrillDownData.mockReturnValue({
            count,
            isLoading,
            rows,
            isPeriodLimited,
            previousPeriod,
        })
        return render(<TopReportedIssuesDrillDown />)
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

    it('does not render the side panel initially', () => {
        renderComponent()

        expect(
            screen.queryByText('Report order issues'),
        ).not.toBeInTheDocument()
    })

    describe('description', () => {
        it('shows the base description when the period is not limited', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: /2 items/i }))

            expect(
                screen.getByText('Top order issues reported.'),
            ).toBeInTheDocument()
        })

        it('shows the 90-day notice when the period is limited', async () => {
            const user = userEvent.setup()
            renderComponent({ isPeriodLimited: true })

            await user.click(screen.getByRole('button', { name: /2 items/i }))

            expect(
                screen.getByText(
                    'Top order issues reported. Showing data for the latest 90 days in the selected period.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('renders issue labels in the table when the panel is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /2 items/i }))

        expect(screen.getByText('Other')).toBeInTheDocument()
        expect(
            screen.getByText("I'd like to edit my order"),
        ).toBeInTheDocument()
    })

    it('renders column headers when the panel is opened', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /2 items/i }))

        expect(screen.getByText('Issue')).toBeInTheDocument()
        expect(screen.getByText('% of issues reported')).toBeInTheDocument()
        expect(screen.getByText('Tickets created')).toBeInTheDocument()
        expect(screen.getByText('Delta')).toBeInTheDocument()
    })

    it('shows the previous period in the delta cell tooltip', async () => {
        const user = userEvent.setup()
        renderComponent({ previousPeriod: 'Dec 1, 2023 - Dec 31, 2023' })

        await user.click(screen.getByRole('button', { name: /2 items/i }))
        await user.hover(screen.getByText('-29'))

        await waitFor(() => {
            expect(
                screen.getByText('Compared with Dec 1, 2023 - Dec 31, 2023'),
            ).toBeInTheDocument()
        })
    })
})
