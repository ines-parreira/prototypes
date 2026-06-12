import React from 'react'

import { render } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetTicketMessageHandler,
    mockGetTicketMessageResponse,
    mockTicketMessageUserOrCustomer,
} from '@gorgias/helpdesk-mocks'

import { MetaRepliedByLabel } from 'pages/tickets/detail/components/TicketMessages/MetaRepliedByLabel'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('MetaRepliedByLabel', () => {
    const reply = {
        ticket_id: 1,
        ticket_message_id: 2,
    }

    it('should trigger a ticket message query and display a loading indicator', async () => {
        let requestUrl: string | undefined
        server.use(
            mockGetTicketMessageHandler(async ({ request }) => {
                requestUrl = request.url

                return new Promise(() => undefined)
            }).handler,
        )

        const { getByText } = render(<MetaRepliedByLabel reply={reply} />)

        await waitFor(() => {
            expect(requestUrl).toContain('/api/tickets/1/messages/2')
        })
        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should display the reply details once the ticket message has been loaded', async () => {
        server.use(
            mockGetTicketMessageHandler(async () =>
                HttpResponse.json(
                    mockGetTicketMessageResponse({
                        sender: mockTicketMessageUserOrCustomer({
                            name: 'John Doe',
                        }),
                    }),
                ),
            ).handler,
        )

        const { queryByText } = render(<MetaRepliedByLabel reply={reply} />)

        await waitFor(() => {
            expect(queryByText('Loading...')).not.toBeInTheDocument()
        })
        expect(queryByText('responded to via Messenger')).toBeInTheDocument()
        expect(queryByText('John Doe')).toBeInTheDocument()
        expect(queryByText('View ticket')).toBeInTheDocument()
        expect(queryByText('View ticket')).toHaveAttribute('href', '1')
    })
})
