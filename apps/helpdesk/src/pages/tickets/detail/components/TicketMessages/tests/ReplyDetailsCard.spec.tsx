import React from 'react'

import { render } from '@repo/testing'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetTicketMessageHandler,
    mockGetTicketMessageResponse,
    mockTicketMessageUserOrCustomer,
} from '@gorgias/helpdesk-mocks'

import { emptyRuleRecipeFixture } from 'fixtures/ruleRecipe'
import { ReplyDetailsCard } from 'pages/tickets/detail/components/TicketMessages/ReplyDetailsCard'

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

describe('ReplyDetailsCard', () => {
    const reply = {
        ticket_id: 1,
        ticket_message_id: 2,
    }

    it('should trigger a ticket message query', async () => {
        const ticketMessageMock = mockGetTicketMessageHandler()
        server.use(ticketMessageMock.handler)
        const waitForTicketMessageRequest =
            ticketMessageMock.waitForRequest(server)

        render(<ReplyDetailsCard reply={reply} />)

        await waitForTicketMessageRequest((request) => {
            expect(request.url).toContain('/api/tickets/1/messages/2')
        })
    })

    it('should not render if the details are not complete', async () => {
        server.use(
            mockGetTicketMessageHandler(async () =>
                HttpResponse.json(
                    mockGetTicketMessageResponse({
                        body_text: 'reply body text',
                    }),
                ),
            ).handler,
        )

        const { queryByText } = render(<ReplyDetailsCard reply={reply} />)

        expect(queryByText('reply body text')).not.toBeInTheDocument()
    })

    it('should reder the details withing an embedded card if the message is fetched', async () => {
        server.use(
            mockGetTicketMessageHandler(async () =>
                HttpResponse.json(
                    mockGetTicketMessageResponse({
                        integration_id: 1,
                        body_text: 'reply body text',
                        source: {
                            type: 'email',
                        },
                        sender: mockTicketMessageUserOrCustomer({
                            id: 123,
                            name: 'John Doe',
                            meta: {},
                        }),
                    }),
                ),
            ).handler,
        )

        const { findByText, getByText } = render(
            <ReplyDetailsCard reply={reply} />,
            {
                storeState: {
                    entities: {
                        rules: {},
                        ruleRecipes: {
                            [emptyRuleRecipeFixture.slug]:
                                emptyRuleRecipeFixture,
                        },
                    },
                },
            },
        )

        expect(await findByText('reply body text')).toBeInTheDocument()
        expect(getByText('JD')).toBeInTheDocument()
    })
})
