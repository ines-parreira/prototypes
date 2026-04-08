import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import type * as HelpdeskQueriesModule from '@gorgias/helpdesk-queries'
import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import type { TicketThreadSocialMediaInstagramDirectMessageItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { InstagramDirectMessage } from './InstagramDirectMessage'

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueriesModule>()
    return { ...actual, useGetTicketMessage: vi.fn() }
})

const mockUseGetTicketMessage = vi.mocked(useGetTicketMessage)

beforeEach(() => {
    vi.clearAllMocks()
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
    )
    mockUseGetTicketMessage.mockReturnValue({ data: undefined } as ReturnType<
        typeof useGetTicketMessage
    >)
})

const baseMessageData = mockTicketMessage({
    id: 42,
    body_text: 'DM message body',
    body_html: null,
    stripped_text: null,
    stripped_html: null,
    integration_id: 7,
    message_id: 'msg-123',
    ticket_id: 99,
    created_datetime: new Date().toISOString(),
    meta: null,
    source: { type: 'instagram-direct-message', from: null, to: [] },
    sender: {
        id: 1,
        name: 'Chris Mizen',
        firstname: 'Chris',
        lastname: 'Mizen',
        email: 'chris@example.com',
        meta: null,
    },
})

function makeItem(
    overrides: Partial<typeof baseMessageData> = {},
): TicketThreadSocialMediaInstagramDirectMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
        data: {
            ...baseMessageData,
            ...overrides,
        } as TicketThreadSocialMediaInstagramDirectMessageItem['data'],
        datetime: baseMessageData.created_datetime,
    }
}

describe('InstagramDirectMessage', () => {
    describe('without replied_to', () => {
        it('renders the DM message body', () => {
            render(<InstagramDirectMessage item={makeItem()} />)

            expect(screen.getByText('DM message body')).toBeInTheDocument()
        })

        it('does not show the original comment context', () => {
            render(<InstagramDirectMessage item={makeItem()} />)

            expect(
                screen.queryByText(/Original comment via/),
            ).not.toBeInTheDocument()
        })
    })

    describe('with replied_to', () => {
        beforeEach(() => {
            mockUseGetTicketMessage.mockReturnValue({
                data: {
                    data: {
                        sender: {
                            id: 20,
                            name: 'chrismizen_',
                            firstname: 'Chris',
                            lastname: 'Mizen',
                            email: 'chris@example.com',
                            meta: null,
                        },
                        body_text: "This doesn't look very athletic to me!",
                        created_datetime: new Date().toISOString(),
                        channel: 'instagram-comment',
                        sent_datetime: null,
                        opened_datetime: null,
                        failed_datetime: null,
                    },
                },
            } as ReturnType<typeof useGetTicketMessage>)
        })

        it('shows the original comment context card with "Original comment via Instagram" label', async () => {
            render(
                <InstagramDirectMessage
                    item={makeItem({
                        from_agent: true,
                        meta: {
                            replied_to: {
                                ticket_id: 50,
                                ticket_message_id: 99,
                            },
                        } as never,
                    })}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Original comment via Instagram'),
                ).toBeInTheDocument()
            })
        })

        it('shows the original comment body text in the context card', async () => {
            render(
                <InstagramDirectMessage
                    item={makeItem({
                        from_agent: true,
                        meta: {
                            replied_to: {
                                ticket_id: 50,
                                ticket_message_id: 99,
                            },
                        } as never,
                    })}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText("This doesn't look very athletic to me!"),
                ).toBeInTheDocument()
            })
        })

        it('still renders the DM message body alongside the context card', async () => {
            render(
                <InstagramDirectMessage
                    item={makeItem({
                        from_agent: true,
                        meta: {
                            replied_to: {
                                ticket_id: 50,
                                ticket_message_id: 99,
                            },
                        } as never,
                    })}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('DM message body')).toBeInTheDocument()
            })
        })
    })
})
