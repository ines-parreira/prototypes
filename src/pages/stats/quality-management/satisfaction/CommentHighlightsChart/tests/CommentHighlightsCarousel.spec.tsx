import {render, screen} from '@testing-library/react'
import React from 'react'

import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import CommentHighlightsCarousel from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCarousel'

const VIEW_TICKET = 'View Ticket'
const NO_DATA_COMMENT = 'No data available for the selected filters.'

const dummyData = [
    {
        ticketId: '1',
        surveyScore: '5',
        comment: 'This is a test comment.',
        assignee: {name: 'Agent A', url: 'http://avatar.url/a.png'},
        customerName: 'Customer A',
    },
]

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Skeleton: () => <div>Skeleton</div>,
}))

describe('CommentHighlightsCarousel', () => {
    it('renders skeletons when fetching', () => {
        const {getAllByText} = render(
            <CommentHighlightsCarousel
                isFetching={true}
                isError={false}
                data={[]}
            />
        )

        expect(getAllByText('Skeleton').length).toEqual(2)
    })

    it('renders slider with provided data when not fetching', () => {
        const {getByText} = render(
            <CommentHighlightsCarousel
                isFetching={false}
                isError={false}
                data={dummyData}
            />
        )

        const viewTicketElement = getByText(VIEW_TICKET)

        expect(viewTicketElement.tagName).toBe('A')
        expect(viewTicketElement).toHaveAttribute('to', '/app/ticket/1')
        expect(getByText('Agent A')).toBeInTheDocument()
        expect(getByText('Customer A')).toBeInTheDocument()
        expect(getByText('This is a test comment.')).toBeInTheDocument()
    })

    it('renders default no-data item when data is empty', () => {
        const {getByText} = render(
            <CommentHighlightsCarousel
                isFetching={false}
                isError={false}
                data={[]}
            />
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
                assignee: null,
                customerName: null,
            },
        ]

        render(
            <CommentHighlightsCarousel
                isFetching={false}
                isError={false}
                data={partialDummyData}
            />
        )

        const placeholders = screen.getAllByText(NOT_AVAILABLE_PLACEHOLDER)

        expect(placeholders.length).toBe(4)
    })

    it('renders View Ticket without link when ticketId is not provided', () => {
        const dummyNoTicketData = [
            {
                ticketId: null,
                surveyScore: '4',
                comment: 'Another test comment.',
                assignee: {name: 'Agent B'},
                customerName: 'Customer B',
            },
        ]

        render(
            <CommentHighlightsCarousel
                isFetching={false}
                isError={false}
                data={dummyNoTicketData}
            />
        )

        const viewTicketElements = screen.getAllByText(VIEW_TICKET)

        viewTicketElements.forEach((el) => {
            expect(el.tagName).toBe('DIV')
        })
    })

    it('renders View Ticket with link when ticketId is provided', () => {
        render(
            <CommentHighlightsCarousel
                isFetching={false}
                isError={false}
                data={dummyData}
            />
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
                assignee: {name: 'Agent Long'},
                customerName: 'Customer Long',
            },
        ]

        render(
            <CommentHighlightsCarousel
                isFetching={false}
                isError={false}
                data={dataWithLongComment}
            />
        )

        const commentElement = screen.getByText((content) =>
            content.endsWith('...')
        )

        expect(commentElement).toBeInTheDocument()
        expect(commentElement.textContent!.length).toBeLessThan(
            longComment.length
        )
    })
})
