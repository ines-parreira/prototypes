import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
import type { TicketSummary } from '@gorgias/helpdesk-types'

import { TicketSummaryBubble } from '../TicketSummaryBubble'

const server = setupServer()

const mockCurrentUser = mockGetCurrentUserHandler()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

beforeEach(() => {
    server.use(mockCurrentUser.handler)
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

const summary: TicketSummary = {
    content: 'Customer contacted support about a delayed order.',
    created_datetime: '2024-01-05T10:00:00Z',
    updated_datetime: '',
    triggered_by: 1,
}

const requestSummary = jest.fn()

describe('TicketSummaryBubble', () => {
    it('renders nothing when there is no summary, no loading state, and no error', () => {
        const { container } = render(
            <TicketSummaryBubble
                summary={null}
                isLoading={false}
                requestSummary={requestSummary}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('shows skeleton rows while the summary is loading', () => {
        render(
            <TicketSummaryBubble
                summary={null}
                isLoading={true}
                requestSummary={requestSummary}
            />,
        )

        expect(screen.getByText('Ticket summary')).toBeInTheDocument()
    })

    it('shows the summary content once loaded', async () => {
        render(
            <TicketSummaryBubble
                summary={summary}
                isLoading={false}
                requestSummary={requestSummary}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Customer contacted support about a delayed order.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('shows the error message when summary generation fails', () => {
        render(
            <TicketSummaryBubble
                summary={null}
                isLoading={false}
                errorMessage="Sorry, something went wrong. We were unable to generate a summary"
                isRetriable={true}
                requestSummary={requestSummary}
            />,
        )

        expect(
            screen.getByText(
                'Sorry, something went wrong. We were unable to generate a summary',
            ),
        ).toBeInTheDocument()
    })

    it('shows a Try again button when the error is retriable', () => {
        render(
            <TicketSummaryBubble
                summary={null}
                isLoading={false}
                errorMessage="Something went wrong"
                isRetriable={true}
                requestSummary={requestSummary}
            />,
        )

        expect(
            screen.getByRole('button', { name: /try again/i }),
        ).toBeInTheDocument()
    })

    it('hides the Try again button when the error is not retriable', () => {
        render(
            <TicketSummaryBubble
                summary={null}
                isLoading={false}
                errorMessage="You do not have permission to generate summaries"
                isRetriable={false}
                requestSummary={requestSummary}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /try again/i }),
        ).not.toBeInTheDocument()
    })

    it('calls requestSummary when the Try again button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <TicketSummaryBubble
                summary={null}
                isLoading={false}
                errorMessage="Something went wrong"
                isRetriable={true}
                requestSummary={requestSummary}
            />,
        )

        await user.click(screen.getByRole('button', { name: /try again/i }))

        expect(requestSummary).toHaveBeenCalledTimes(1)
    })

    it('hides the summary content when the bubble is collapsed', async () => {
        const user = userEvent.setup()

        render(
            <TicketSummaryBubble
                summary={summary}
                isLoading={false}
                requestSummary={requestSummary}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Customer contacted support about a delayed order.',
                ),
            ).toBeInTheDocument()
        })

        const [collapseButton] = screen.getAllByRole('button')
        await user.click(collapseButton)

        expect(
            screen.queryByText(
                'Customer contacted support about a delayed order.',
            ),
        ).not.toBeInTheDocument()
    })

    it('restores the summary content when the bubble is expanded again', async () => {
        const user = userEvent.setup()

        render(
            <TicketSummaryBubble
                summary={summary}
                isLoading={false}
                requestSummary={requestSummary}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Customer contacted support about a delayed order.',
                ),
            ).toBeInTheDocument()
        })

        const [collapseButton] = screen.getAllByRole('button')
        await user.click(collapseButton)
        await user.click(collapseButton)

        expect(
            screen.getByText(
                'Customer contacted support about a delayed order.',
            ),
        ).toBeInTheDocument()
    })
})
