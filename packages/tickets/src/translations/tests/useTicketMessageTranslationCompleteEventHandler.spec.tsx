import { useFlag } from '@repo/feature-flags'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEventWithType } from '@gorgias/events'
import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockListTicketMessageTranslationsHandler,
    mockListTicketTranslationsHandler,
    mockTicket,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
import type { CurrentUser } from '../hooks/useCurrentUserLanguagePreferences'
import { useTicketMessageTranslationCompleteEventHandler } from '../hooks/useLiveTicketTranslationsUpdates/useTicketMessageTranslationCompleteEventHandler'
import { useTicketMessageTranslations } from '../hooks/useTicketMessageTranslations'
import { useTicketsTranslatedProperties } from '../hooks/useTicketsTranslatedProperties'
import { DisplayedContent, FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MessagesTranslations: 'MessagesTranslations',
    },
    useFlag: vi.fn(),
}))

const mockUseFlag = vi.mocked(useFlag)
const server = setupServer()
const routeOptions = {
    initialEntries: ['/tickets/123'],
    path: '/tickets/:ticketId',
}

const translationCompletedEvent: DomainEventWithType<'//helpdesk/ticket-message-translation.completed'> =
    {
        id: 'test-event-1',
        dataschema: '//helpdesk/ticket-message-translation.completed/1.0.1',
        data: {
            id: 'translation-1',
            ticket_id: 123,
            ticket_message_id: 456,
            language: Language.Fr,
            account_id: 1,
            completed_datetime: '2023-01-01T00:00:00Z',
            requested_datetime: '2023-01-01T00:00:00Z',
            stripped_html: '<p>Translated content</p>',
            stripped_text: 'Translated content',
        },
        type: 'ticket-message-translation.completed',
        source: 'helpdesk',
        subject: 'message-456',
    }

const mockGetCurrentUserFrench = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [
            {
                id: 1,
                type: UserSettingType.LanguagePreferences,
                data: {
                    primary: Language.Fr,
                    proficient: [Language.En],
                    enabled: true,
                },
            },
        ],
    } as CurrentUser['data']),
)

function makeTicket(messageIds: number[]) {
    return mockTicket({
        id: 123,
        messages: messageIds.map((id) => ({ id }) as never),
    })
}

const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(makeTicket([456, 789])),
)

const mockListTicketMessageTranslations =
    mockListTicketMessageTranslationsHandler(async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
    )

const mockListTicketTranslations = mockListTicketTranslationsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
)

function useTicketMessageTranslationHarness(ticketId = 123) {
    const ticketMessageTranslations = useTicketMessageTranslations({
        ticket_id: ticketId,
    })
    const { handleTicketMessageTranslationCompleted } =
        useTicketMessageTranslationCompleteEventHandler()

    return {
        ticketMessageTranslations,
        handleTicketMessageTranslationCompleted,
    }
}

function useTicketMessageInvalidationHarness() {
    const ticketMessageTranslations = useTicketMessageTranslations({
        ticket_id: 123,
    })
    const firstTicketTranslations = useTicketsTranslatedProperties({
        ticket_ids: [123, 456],
    })
    const secondTicketTranslations = useTicketsTranslatedProperties({
        ticket_ids: [123],
    })
    const unrelatedTicketTranslations = useTicketsTranslatedProperties({
        ticket_ids: [999],
    })
    const { handleTicketMessageTranslationCompleted } =
        useTicketMessageTranslationCompleteEventHandler()

    return {
        ticketMessageTranslations,
        firstTicketTranslations,
        secondTicketTranslations,
        unrelatedTicketTranslations,
        handleTicketMessageTranslationCompleted,
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    mockUseFlag.mockReturnValue(true)
    useTicketMessageTranslationDisplay.setState({
        ticketMessagesTranslationDisplayMap: {},
        allMessageDisplayState: DisplayedContent.Translated,
    })
    server.use(
        mockGetCurrentUserFrench.handler,
        mockGetTicket.handler,
        mockListTicketMessageTranslations.handler,
        mockListTicketTranslations.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTicketMessageTranslationCompleteEventHandler', () => {
    it('returns the ticket message translation completion handler', () => {
        const { result } = renderHook(
            () => useTicketMessageTranslationCompleteEventHandler(),
            routeOptions,
        )

        expect(result.current).toEqual({
            handleTicketMessageTranslationCompleted: expect.any(Function),
        })
    })

    it('adds the completed translation and updates the message display state', async () => {
        const existingTranslation = {
            ...mockTicketMessageTranslation(),
            id: 'existing-translation',
            ticket_id: 123,
            ticket_message_id: 789,
            language: Language.Fr,
            translated_body: 'Existing translation',
        }
        const { handler } = mockListTicketMessageTranslationsHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [existingTranslation],
                }),
        )
        server.use(handler)

        const { result } = renderHook(
            () => useTicketMessageTranslationHarness(),
            routeOptions,
        )

        await waitFor(() => {
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap,
            ).toEqual({
                789: existingTranslation,
            })
        })

        act(() => {
            result.current.handleTicketMessageTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap[456],
            ).toEqual(translationCompletedEvent.data)
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap[789],
            ).toEqual(existingTranslation)
            expect(
                useTicketMessageTranslationDisplay
                    .getState()
                    .getTicketMessageTranslationDisplay(456),
            ).toEqual({
                messageId: 456,
                display: DisplayedContent.Translated,
                fetchingState: FetchingState.Completed,
                hasRegeneratedOnce: false,
            })
        })
    })

    it('replaces the existing translation for the completed message', async () => {
        const existingTranslation = {
            ...mockTicketMessageTranslation(),
            id: 'old-translation',
            ticket_id: 123,
            ticket_message_id: 456,
            language: Language.Fr,
            translated_body: 'Old translation',
            status: 'pending',
        }
        const otherTranslation = {
            ...mockTicketMessageTranslation(),
            id: 'other-translation',
            ticket_id: 123,
            ticket_message_id: 789,
            language: Language.Fr,
            translated_body: 'Other translation',
        }
        const { handler } = mockListTicketMessageTranslationsHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [existingTranslation, otherTranslation],
                }),
        )
        server.use(handler)

        const { result } = renderHook(
            () => useTicketMessageTranslationHarness(),
            routeOptions,
        )

        await waitFor(() => {
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap,
            ).toEqual({
                456: existingTranslation,
                789: otherTranslation,
            })
        })

        act(() => {
            result.current.handleTicketMessageTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap[456],
            ).toEqual({
                ...existingTranslation,
                ...translationCompletedEvent.data,
            })
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap[789],
            ).toEqual(otherTranslation)
        })
    })

    it('refetches every matching ticket translation query when the first message completes', async () => {
        const requestCounts = new Map<string, number>()
        const { handler } = mockListTicketTranslationsHandler(
            async ({ data, request }) => {
                const key = new URL(request.url).searchParams
                    .getAll('ticket_ids')
                    .sort()
                    .join(',')

                requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1)

                return HttpResponse.json({
                    ...data,
                    data: [],
                })
            },
        )
        server.use(handler)

        const { result } = renderHook(
            () => useTicketMessageInvalidationHarness(),
            routeOptions,
        )

        await waitFor(() => {
            expect(requestCounts.get('123')).toBe(1)
            expect(requestCounts.get('123,456')).toBe(1)
            expect(requestCounts.get('999')).toBe(1)
        })

        act(() => {
            result.current.handleTicketMessageTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap[456],
            ).toEqual(translationCompletedEvent.data)
            expect(requestCounts.get('123')).toBeGreaterThan(1)
            expect(requestCounts.get('123,456')).toBeGreaterThan(1)
            expect(requestCounts.get('999')).toBe(1)
        })
    })

    it('does not refetch ticket translations when a non-first message completes', async () => {
        const nonFirstMessageEvent: DomainEventWithType<'//helpdesk/ticket-message-translation.completed'> =
            {
                ...translationCompletedEvent,
                data: {
                    ...translationCompletedEvent.data,
                    id: 'translation-2',
                    ticket_message_id: 789,
                },
                subject: 'message-789',
            }
        const requestCounts = new Map<string, number>()
        const { handler } = mockListTicketTranslationsHandler(
            async ({ data, request }) => {
                const key = new URL(request.url).searchParams
                    .getAll('ticket_ids')
                    .sort()
                    .join(',')

                requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1)

                return HttpResponse.json({
                    ...data,
                    data: [],
                })
            },
        )
        server.use(handler)

        const { result } = renderHook(
            () => useTicketMessageInvalidationHarness(),
            routeOptions,
        )

        await waitFor(() => {
            expect(requestCounts.get('123')).toBe(1)
            expect(requestCounts.get('123,456')).toBe(1)
            expect(requestCounts.get('999')).toBe(1)
        })

        act(() => {
            result.current.handleTicketMessageTranslationCompleted(
                nonFirstMessageEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.ticketMessageTranslations
                    .ticketMessagesTranslationMap[789],
            ).toEqual(nonFirstMessageEvent.data)
        })

        expect(requestCounts.get('123')).toBe(1)
        expect(requestCounts.get('123,456')).toBe(1)
        expect(requestCounts.get('999')).toBe(1)
    })
})
