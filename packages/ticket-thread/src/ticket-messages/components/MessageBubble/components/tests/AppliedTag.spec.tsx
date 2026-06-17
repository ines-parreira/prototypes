import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListTicketTagsHandler,
    mockListTicketTagsResponse,
} from '@gorgias/helpdesk-mocks'

import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { AppliedTag } from '#ticket-messages/components/MessageBubble/components/AppliedTag'

describe('AppliedTag', () => {
    it('renders the tag name', () => {
        server.use(mockListTicketTagsHandler().handler)

        const { getByText } = render(
            <AppliedTag name="urgent" ticketId={123} />,
        )

        expect(getByText('urgent')).toBeInTheDocument()
    })

    it('shows a colored dot when the ticket tag has a decoration color', async () => {
        server.use(
            mockListTicketTagsHandler(async () =>
                HttpResponse.json(
                    mockListTicketTagsResponse({
                        data: [
                            {
                                id: 1,
                                name: 'urgent',
                                decoration: { color: '#ff0000' },
                            },
                        ],
                    }),
                ),
            ).handler,
        )

        const { container } = render(
            <AppliedTag name="urgent" ticketId={123} />,
        )

        await waitFor(() => {
            expect(
                container.querySelector('[data-name="dot"]'),
            ).toBeInTheDocument()
        })
    })

    it('shows no dot when the tag has no decoration color', async () => {
        server.use(
            mockListTicketTagsHandler(async () =>
                HttpResponse.json(
                    mockListTicketTagsResponse({
                        data: [{ id: 1, name: 'urgent' }],
                    }),
                ),
            ).handler,
        )

        const { container } = render(
            <AppliedTag name="urgent" ticketId={123} />,
        )

        await waitFor(() => {
            expect(
                container.querySelector('[data-name="dot"]'),
            ).not.toBeInTheDocument()
        })
    })
})
