import type * as TicketsModule from '@repo/tickets'
import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockGetTicketMessageHandler,
    mockGetUserAvailabilityHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import { getCurrentUserHandler } from '#tests/getCurrentUser.mock'
import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { TicketThreadItemTag } from '#thread/itemTags'
import type { TicketThreadSocialMediaFacebookMessageItem } from '#ticket-messages/types'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { FacebookMessengerMessage } from './FacebookMessengerMessage'

vi.mock('@repo/tickets', async () => {
    const actual = await vi.importActual<typeof TicketsModule>('@repo/tickets')
    return {
        ...actual,
        useCurrentUserLanguagePreferences: vi.fn(() => ({
            shouldShowTranslatedContent: () => false,
        })),
        useTicketMessageTranslations: vi.fn(() => ({
            getMessageTranslation: () => null,
        })),
        useTicketMessageDisplayState: vi.fn(() => ({
            display: actual.DisplayedContent.Original,
        })),
    }
})

const mockUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)
const mockUseTicketMessageTranslations = vi.mocked(useTicketMessageTranslations)
const mockUseTicketMessageDisplayState = vi.mocked(useTicketMessageDisplayState)

beforeEach(() => {
    vi.clearAllMocks()
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
            user_id: 1,
        },
    }
    server.use(
        getCurrentUserHandler().handler,
        http.get('/api/users/:id', () => HttpResponse.json({})),
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(mockTicket({ id: Number(params?.id ?? 1) })),
        ).handler,
        mockGetCustomerHandler().handler,
        mockGetUserAvailabilityHandler().handler,
    )
    mockUseCurrentUserLanguagePreferences.mockReturnValue({
        shouldShowTranslatedContent: () => false,
    } as ReturnType<typeof useCurrentUserLanguagePreferences>)
    mockUseTicketMessageTranslations.mockReturnValue({
        getMessageTranslation: () => null,
    } as unknown as ReturnType<typeof useTicketMessageTranslations>)
    mockUseTicketMessageDisplayState.mockReturnValue({
        display: DisplayedContent.Original,
    } as ReturnType<typeof useTicketMessageDisplayState>)
})

const baseMessageData = mockTicketMessage({
    id: 42,
    body_text: 'Messenger message body',
    body_html: null,
    stripped_text: null,
    stripped_html: null,
    integration_id: 7,
    message_id: 'msg-123',
    ticket_id: 99,
    created_datetime: new Date().toISOString(),
    meta: null,
    source: { type: 'facebook-message', from: null, to: [] },
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
): TicketThreadSocialMediaFacebookMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
        data: {
            ...baseMessageData,
            ...overrides,
        } as TicketThreadSocialMediaFacebookMessageItem['data'],
        datetime: baseMessageData.created_datetime,
    }
}

describe('FacebookMessengerMessage', () => {
    describe('without replied_to', () => {
        it('renders the Messenger message body', () => {
            render(<FacebookMessengerMessage item={makeItem()} />)

            expect(
                screen.getByText('Messenger message body'),
            ).toBeInTheDocument()
        })

        it('renders the translated Messenger message body when translation display is enabled', () => {
            mockUseCurrentUserLanguagePreferences.mockReturnValue({
                shouldShowTranslatedContent: () => true,
            } as ReturnType<typeof useCurrentUserLanguagePreferences>)
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Translated,
            } as ReturnType<typeof useTicketMessageDisplayState>)
            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: () =>
                    mockTicketMessageTranslation({
                        ticket_message_id: 42,
                        stripped_text: 'Translated Messenger message body',
                        stripped_html: null,
                    }),
            } as unknown as ReturnType<typeof useTicketMessageTranslations>)

            render(<FacebookMessengerMessage item={makeItem()} />)

            expect(
                screen.getByText('Translated Messenger message body'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Messenger message body'),
            ).not.toBeInTheDocument()
        })

        it('renders message attachments', () => {
            render(
                <FacebookMessengerMessage
                    item={makeItem({
                        attachments: [
                            {
                                name: 'messenger-receipt.pdf',
                                url: 'https://cdn.example.com/messenger-receipt.pdf',
                                content_type: 'application/pdf',
                                size: 1234,
                            },
                        ],
                    })}
                />,
            )

            expect(
                screen.getByRole('link', { name: 'messenger-receipt.pdf' }),
            ).toBeInTheDocument()
        })

        it('does not show the original comment context', () => {
            render(<FacebookMessengerMessage item={makeItem()} />)

            expect(
                screen.queryByText(/Original comment via/),
            ).not.toBeInTheDocument()
        })
    })

    describe('with replied_to', () => {
        beforeEach(() => {
            server.use(
                mockGetTicketMessageHandler(async () =>
                    HttpResponse.json(
                        mockTicketMessage({
                            id: 99,
                            ticket_id: 50,
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
                            channel: 'facebook-comment',
                            sent_datetime: null,
                            opened_datetime: null,
                            failed_datetime: null,
                        }),
                    ),
                ).handler,
            )
        })

        it('shows the original comment context card with "Original comment via Facebook" label', async () => {
            render(
                <FacebookMessengerMessage
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
                    screen.getByText('Original comment via Facebook'),
                ).toBeInTheDocument()
            })
        })

        it('shows the original comment body text in the context card', async () => {
            render(
                <FacebookMessengerMessage
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

        it('still renders the Messenger message body alongside the context card', async () => {
            render(
                <FacebookMessengerMessage
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
                    screen.getByText('Messenger message body'),
                ).toBeInTheDocument()
            })
        })
    })
})
