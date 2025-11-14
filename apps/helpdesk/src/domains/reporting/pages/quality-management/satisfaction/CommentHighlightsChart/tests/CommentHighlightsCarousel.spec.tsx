import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import CommentHighlightsCarousel, {
    UNASSIGNED_TICKET_LABEL,
} from 'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel'

const VIEW_TICKET = 'View Ticket'
const NO_DATA_COMMENT = 'No data available for the selected filters.'

const dummyData = [
    {
        ticketId: '1',
        surveyScore: '5',
        comment: 'This is a test comment.',
        assignedAgent: { name: 'Agent A', url: 'http://avatar.url/a.png' },
        customerName: 'Customer A',
        assignedTeam: { name: 'Team A', emoji: '👍' },
    },
]

jest.mock('@gorgias/axiom', () => ({
    Skeleton: () => <div>Skeleton</div>,
}))

describe('CommentHighlightsCarousel', () => {
    it('renders skeletons when fetching', () => {
        const { getAllByText } = render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={true}
                    isError={false}
                    data={[]}
                />
            </MemoryRouter>,
        )

        expect(getAllByText('Skeleton').length).toEqual(2)
    })

    it('renders slider with provided data when not fetching', () => {
        const { getByText } = render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dummyData}
                />
            </MemoryRouter>,
        )

        const viewTicketElement = getByText(VIEW_TICKET)

        expect(viewTicketElement.tagName).toBe('A')
        expect(viewTicketElement).toHaveAttribute('href', '/app/ticket/1')
        expect(getByText('Agent A')).toBeInTheDocument()
        expect(getByText('Customer A')).toBeInTheDocument()
        expect(getByText('This is a test comment.')).toBeInTheDocument()
    })

    it('renders slider with assignedTeam when assignedAgent is not provided', () => {
        const dummyDataWithoutAgent = [
            {
                ticketId: '1',
                surveyScore: '5',
                comment: 'This is a test comment.',
                assignedAgent: null,
                customerName: 'Customer A',
                assignedTeam: { name: 'Team A', emoji: '👍' },
            },
        ]

        const { getByText } = render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dummyDataWithoutAgent}
                />
            </MemoryRouter>,
        )

        expect(getByText('Team A')).toBeInTheDocument()
        expect(getByText('👍')).toBeInTheDocument()
    })

    it('renders slider with assignedTeam when emoji is not provided', () => {
        const dummyDataWithoutAgent = [
            {
                ticketId: '1',
                surveyScore: '5',
                comment: 'This is a test comment.',
                assignedAgent: null,
                customerName: 'Customer A',
                assignedTeam: { name: 'Team A' },
            },
        ]

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dummyDataWithoutAgent}
                />
            </MemoryRouter>,
        )

        const emojiElement = queryByText('👍')

        expect(getByText('Team A')).toBeInTheDocument()
        expect(emojiElement).not.toBeInTheDocument()
    })

    it('renders slider with unassigned placeholder when assignedAgent and assignedTeam are not provided', () => {
        const dummyDataWithoutAgentAndTeam = [
            {
                ticketId: '1',
                surveyScore: '5',
                comment: 'This is a test comment.',
                assignedAgent: null,
                customerName: 'Customer A',
                assignedTeam: null,
            },
        ]

        const { getByText } = render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dummyDataWithoutAgentAndTeam}
                />
            </MemoryRouter>,
        )

        expect(getByText(UNASSIGNED_TICKET_LABEL)).toBeInTheDocument()
    })

    it('renders default no-data item when data is empty', () => {
        const { getByText } = render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={[]}
                />
            </MemoryRouter>,
        )

        expect(getByText(NO_DATA_COMMENT)).toBeInTheDocument()
        expect(getByText('No data')).toBeInTheDocument()
    })

    it('renders placeholder when partial data is provided', () => {
        const partialDummyData = [
            {
                ticketId: '1',
                surveyScore: null,
                comment: null,
                assignedAgent: null,
                customerName: null,
                assignedTeam: null,
            },
        ]

        render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={partialDummyData}
                />
            </MemoryRouter>,
        )

        const placeholders = screen.getAllByText(NOT_AVAILABLE_PLACEHOLDER)

        expect(placeholders.length).toBe(3)
    })

    it('renders View Ticket without link when ticketId is not provided', () => {
        const dummyNoTicketData = [
            {
                ticketId: null,
                surveyScore: '4',
                comment: 'Another test comment.',
                assignedAgent: { name: 'Agent B' },
                customerName: 'Customer B',
                assignedTeam: { name: 'Team B', emoji: '👎' },
            },
        ]

        render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dummyNoTicketData}
                />
            </MemoryRouter>,
        )

        const viewTicketElements = screen.getAllByText(VIEW_TICKET)

        viewTicketElements.forEach((el) => {
            expect(el.tagName).toBe('DIV')
        })
    })

    it('renders View Ticket with link when ticketId is provided', () => {
        render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dummyData}
                />
            </MemoryRouter>,
        )

        const viewTicketElements = screen.getAllByText(VIEW_TICKET)

        viewTicketElements.forEach((el) => {
            expect(el.tagName).toBe('A')
        })
    })

    it('truncates long comments properly', () => {
        const longComment = 'a'.repeat(400)
        const dataWithLongComment = [
            {
                ticketId: '2',
                surveyScore: '3',
                comment: longComment,
                assignedAgent: { name: 'Agent Long' },
                customerName: 'Customer Long',
                assignedTeam: { name: 'Team Long', emoji: '🤷' },
            },
        ]

        render(
            <MemoryRouter>
                <CommentHighlightsCarousel
                    isFetching={false}
                    isError={false}
                    data={dataWithLongComment}
                />
            </MemoryRouter>,
        )

        const commentElement = screen.getByText((content) =>
            content.endsWith('...'),
        )

        expect(commentElement).toBeInTheDocument()
        expect(commentElement.textContent!.length).toBeLessThan(
            longComment.length,
        )
    })
})
