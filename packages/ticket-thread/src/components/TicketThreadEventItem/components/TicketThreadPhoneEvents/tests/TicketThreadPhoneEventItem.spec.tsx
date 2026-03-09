import type { ReactNode } from 'react'

import { screen } from '@testing-library/react'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadPhoneEventItem } from '../../../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../../../hooks/types'
import { render } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'
import { TicketThreadPhoneEventItem as TicketThreadPhoneEventItemComponent } from '../TicketThreadPhoneEventItem'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>

    return {
        ...actual,
        Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
        TooltipTrigger: ({ children }: { children: ReactNode }) => (
            <>{children}</>
        ),
        TooltipContent: ({ children }: { children: ReactNode }) => (
            <>{children}</>
        ),
    }
})

function getUsersHandler(users: unknown[]) {
    return mockListUsersHandler(async () =>
        HttpResponse.json(
            mockListUsersResponse({
                data: users as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }),
        ),
    )
}

function buildItem({
    eventOverrides,
}: {
    eventOverrides?: Partial<TicketThreadPhoneEventItem['data']>
} = {}): TicketThreadPhoneEventItem {
    const baseEventData: TicketThreadPhoneEventItem['data'] = {
        object_type: 'Ticket',
        type: 'phone-call-conversation-started',
        created_datetime: '2024-03-21T11:00:00Z',
        user_id: 42,
        data: {
            customer: {
                name: 'Customer Name',
            },
        },
    }

    return {
        _tag: TicketThreadItemTag.Events.PhoneEvent,
        datetime: '2024-03-21T11:00:00Z',
        data: {
            ...baseEventData,
            ...eventOverrides,
            data: {
                ...baseEventData.data,
                ...(eventOverrides?.data ?? {}),
            },
        },
    }
}

describe('TicketThreadPhoneEventItem', () => {
    beforeEach(() => {
        server.use(getUsersHandler([]).handler)
    })

    it.each<[TicketThreadPhoneEventItem['data']['type'], string]>([
        ['phone-call-conversation-started', 'Phone conversation started'],
        [
            'phone-call-forwarded-to-external-number',
            'Call forwarded to an external number',
        ],
        [
            'phone-call-forwarded-to-gorgias-number',
            'Call forwarded to a Gorgias number',
        ],
        ['phone-call-forwarded', 'Call forwarded'],
        ['message-played', 'Message played'],
    ])('renders title for %s', (type, expectedLabel) => {
        render(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        type,
                        user_id: undefined,
                    },
                })}
            />,
        )

        expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    })

    it('renders conversation-started with agent attribution from user id lookup', async () => {
        server.use(
            getUsersHandler([
                mockUser({
                    id: 42,
                    name: 'Alex Agent',
                }),
            ]).handler,
        )

        render(<TicketThreadPhoneEventItemComponent item={buildItem()} />)

        expect(
            await screen.findByText('Phone conversation started by Alex Agent'),
        ).toBeInTheDocument()
    })

    it('falls back to payload user name when user lookup does not resolve', async () => {
        render(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        user_id: 999,
                        user: {
                            name: 'Payload Agent',
                        },
                    },
                })}
            />,
        )

        expect(
            await screen.findByText(
                'Phone conversation started by Payload Agent',
            ),
        ).toBeInTheDocument()
    })

    it('renders the "View ticket" link when phone ticket id exists', () => {
        render(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        data: {
                            phone_ticket_id: 123,
                        },
                    },
                })}
            />,
        )

        expect(
            screen.getByRole('link', { name: 'View ticket' }),
        ).toHaveAttribute('href', '/app/ticket/123')
    })

    it.each<[TicketThreadPhoneEventItem['data']['type'], boolean]>([
        ['phone-call-forwarded-to-external-number', true],
        ['phone-call-forwarded-to-gorgias-number', true],
        ['message-played', true],
        ['phone-call-conversation-started', false],
        ['phone-call-forwarded', false],
    ])(
        'shows details icon for %s when expected=%s',
        (type, hasDetailsIconExpected) => {
            render(
                <TicketThreadPhoneEventItemComponent
                    item={buildItem({
                        eventOverrides: {
                            type,
                        },
                    })}
                />,
            )

            if (hasDetailsIconExpected) {
                expect(
                    screen.getByRole('button', {
                        name: 'Show phone event details',
                    }),
                ).toBeInTheDocument()
                return
            }

            expect(
                screen.queryByRole('button', {
                    name: 'Show phone event details',
                }),
            ).not.toBeInTheDocument()
        },
    )

    it('renders forwarded tooltip details with formatted number', () => {
        const forwardedNumber = '+14567654985'
        const expectedFormattedNumber =
            parsePhoneNumberFromString(
                forwardedNumber,
            )?.formatInternational() ?? forwardedNumber

        render(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        type: 'phone-call-forwarded-to-external-number',
                        data: {
                            call: {
                                selected_menu_option: {
                                    forward_call: {
                                        phone_number: forwardedNumber,
                                    },
                                },
                            },
                        },
                    },
                })}
            />,
        )

        expect(screen.getByText('Forwarded to:')).toBeInTheDocument()
        expect(screen.getByText(expectedFormattedNumber)).toBeInTheDocument()
    })

    it('renders message-played audio and text tooltip details', () => {
        const { rerender } = render(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        type: 'message-played',
                        data: {
                            call: {
                                selected_menu_option: {
                                    voice_message: {
                                        voice_message_type: 'voice_recording',
                                        new_voice_recording_file_name:
                                            'voice.mp3',
                                    },
                                },
                            },
                        },
                    },
                })}
            />,
        )

        expect(screen.getByText('Audio recording:')).toBeInTheDocument()
        expect(screen.getByText('voice.mp3')).toBeInTheDocument()

        rerender(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        type: 'message-played',
                        data: {
                            call: {
                                selected_menu_option: {
                                    voice_message: {
                                        voice_message_type: 'text_to_speech',
                                        text_to_speech_content:
                                            'Text to speech content',
                                    },
                                },
                            },
                        },
                    },
                })}
            />,
        )

        expect(screen.getByText('Text:')).toBeInTheDocument()
        expect(screen.getByText('Text to speech content')).toBeInTheDocument()
    })

    it('shows "No additional details" when details payload is missing', () => {
        render(
            <TicketThreadPhoneEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        type: 'message-played',
                    },
                })}
            />,
        )

        expect(screen.getByText('No additional details')).toBeInTheDocument()
    })

    it('renders the event datetime', () => {
        render(<TicketThreadPhoneEventItemComponent item={buildItem()} />)

        expect(screen.getByText('2024-03-21')).toBeInTheDocument()
    })
})
