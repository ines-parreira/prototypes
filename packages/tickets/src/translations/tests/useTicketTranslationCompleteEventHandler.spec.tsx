import { useFlag } from '@repo/feature-flags'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEventWithType } from '@gorgias/events'
import {
    mockGetCurrentUserHandler,
    mockListTicketTranslationsHandler,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
import type { CurrentUser } from '../hooks/useCurrentUserLanguagePreferences'
import { useTicketTranslationCompleteEventHandler } from '../hooks/useLiveTicketTranslationsUpdates/useTicketTranslationCompleteEventHandler'
import { useTicketsTranslatedProperties } from '../hooks/useTicketsTranslatedProperties'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MessagesTranslations: 'MessagesTranslations',
    },
    useFlag: vi.fn(),
}))

const mockUseFlag = vi.mocked(useFlag)
const server = setupServer()

const translationCompletedEvent: DomainEventWithType<'//helpdesk/ticket-translation.completed'> =
    {
        id: 'test-event-1',
        dataschema: '//helpdesk/ticket-translation.completed/1.0.1',
        data: {
            ticket_id: 123,
            language: Language.Fr,
            account_id: 1,
            completed_datetime: '2023-01-01T00:00:00Z',
            id: 'translation-123',
            requested_datetime: '2023-01-01T00:00:00Z',
            subject: 'Translated subject',
        },
        type: 'ticket-translation.completed',
        source: 'helpdesk',
        subject: 'ticket-123',
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

const mockListTicketTranslations = mockListTicketTranslationsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
)

function useTicketTranslationHarness(ticketIds: number[]) {
    const ticketTranslations = useTicketsTranslatedProperties({
        ticket_ids: ticketIds,
    })
    const { handleTicketTranslationCompleted } =
        useTicketTranslationCompleteEventHandler()

    return {
        ticketTranslations,
        handleTicketTranslationCompleted,
    }
}

function useDualTicketTranslationHarness(
    firstTicketIds: number[],
    secondTicketIds: number[],
) {
    const firstTicketTranslations = useTicketsTranslatedProperties({
        ticket_ids: firstTicketIds,
    })
    const secondTicketTranslations = useTicketsTranslatedProperties({
        ticket_ids: secondTicketIds,
    })
    const { handleTicketTranslationCompleted } =
        useTicketTranslationCompleteEventHandler()

    return {
        firstTicketTranslations,
        secondTicketTranslations,
        handleTicketTranslationCompleted,
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    mockUseFlag.mockReturnValue(true)
    server.use(
        mockGetCurrentUserFrench.handler,
        mockListTicketTranslations.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTicketTranslationCompleteEventHandler', () => {
    it('returns the ticket translation completion handler', () => {
        const { result } = renderHook(() =>
            useTicketTranslationCompleteEventHandler(),
        )

        expect(result.current).toEqual({
            handleTicketTranslationCompleted: expect.any(Function),
        })
    })

    it('adds the completed translation to the matching ticket translations query', async () => {
        const existingTranslation = mockTicketTranslationCompact({
            ticket_id: 456,
            ticket_translation_id: 'translation-456',
            subject: 'Existing subject',
            excerpt: 'Existing excerpt',
        })
        const { handler } = mockListTicketTranslationsHandler(
            async ({ data, request }) => {
                const ticketIds = new URL(request.url).searchParams.getAll(
                    'ticket_ids',
                )

                return HttpResponse.json({
                    ...data,
                    data: ticketIds.includes('456')
                        ? [existingTranslation]
                        : [],
                })
            },
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useTicketTranslationHarness([123, 456]),
        )

        await waitFor(() => {
            expect(result.current.ticketTranslations.translationMap).toEqual({
                456: existingTranslation,
            })
        })

        act(() => {
            result.current.handleTicketTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.ticketTranslations.translationMap[456],
            ).toEqual(existingTranslation)
            expect(
                result.current.ticketTranslations.translationMap[123],
            ).toEqual({
                excerpt: null,
                ticket_translation_id: null,
                ...translationCompletedEvent.data,
            })
        })
    })

    it('replaces the existing translation for the completed ticket', async () => {
        const existingTicketTranslation = mockTicketTranslationCompact({
            ticket_id: 123,
            ticket_translation_id: 'old-translation-id',
            subject: 'Old subject',
            excerpt: 'Old excerpt',
        })
        const otherTicketTranslation = mockTicketTranslationCompact({
            ticket_id: 456,
            ticket_translation_id: 'translation-456',
            subject: 'Other subject',
            excerpt: 'Other excerpt',
        })
        const { handler } = mockListTicketTranslationsHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [existingTicketTranslation, otherTicketTranslation],
                }),
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useTicketTranslationHarness([123, 456]),
        )

        await waitFor(() => {
            expect(result.current.ticketTranslations.translationMap).toEqual({
                123: existingTicketTranslation,
                456: otherTicketTranslation,
            })
        })

        act(() => {
            result.current.handleTicketTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.ticketTranslations.translationMap[123],
            ).toEqual({
                ...existingTicketTranslation,
                excerpt: null,
                ticket_translation_id: null,
                ...translationCompletedEvent.data,
            })
            expect(
                result.current.ticketTranslations.translationMap[456],
            ).toEqual(otherTicketTranslation)
        })
    })

    it('does not update unrelated ticket translation queries', async () => {
        const unrelatedTranslation = mockTicketTranslationCompact({
            ticket_id: 456,
            ticket_translation_id: 'translation-456',
            subject: 'Unrelated subject',
            excerpt: 'Unrelated excerpt',
        })
        const { handler } = mockListTicketTranslationsHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [unrelatedTranslation],
                }),
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useTicketTranslationHarness([456, 789]),
        )

        await waitFor(() => {
            expect(result.current.ticketTranslations.translationMap).toEqual({
                456: unrelatedTranslation,
            })
        })

        act(() => {
            result.current.handleTicketTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(result.current.ticketTranslations.translationMap).toEqual({
                456: unrelatedTranslation,
            })
        })
    })

    it('updates every matching mounted ticket translation query', async () => {
        const firstExistingTranslation = mockTicketTranslationCompact({
            ticket_id: 456,
            ticket_translation_id: 'translation-456',
            subject: 'Existing first subject',
            excerpt: 'Existing first excerpt',
        })
        const secondExistingTranslation = mockTicketTranslationCompact({
            ticket_id: 789,
            ticket_translation_id: 'translation-789',
            subject: 'Existing second subject',
            excerpt: 'Existing second excerpt',
        })
        const { handler } = mockListTicketTranslationsHandler(
            async ({ data, request }) => {
                const ticketIds = new URL(request.url).searchParams
                    .getAll('ticket_ids')
                    .sort()
                    .join(',')

                return HttpResponse.json({
                    ...data,
                    data:
                        ticketIds === '123,456'
                            ? [firstExistingTranslation]
                            : ticketIds === '123,789'
                              ? [secondExistingTranslation]
                              : [],
                })
            },
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useDualTicketTranslationHarness([123, 456], [123, 789]),
        )

        await waitFor(() => {
            expect(
                result.current.firstTicketTranslations.translationMap,
            ).toEqual({
                456: firstExistingTranslation,
            })
            expect(
                result.current.secondTicketTranslations.translationMap,
            ).toEqual({
                789: secondExistingTranslation,
            })
        })

        act(() => {
            result.current.handleTicketTranslationCompleted(
                translationCompletedEvent,
            )
        })

        await waitFor(() => {
            expect(
                result.current.firstTicketTranslations.translationMap[123],
            ).toEqual({
                excerpt: null,
                ticket_translation_id: null,
                ...translationCompletedEvent.data,
            })
            expect(
                result.current.firstTicketTranslations.translationMap[456],
            ).toEqual(firstExistingTranslation)

            expect(
                result.current.secondTicketTranslations.translationMap[123],
            ).toEqual({
                excerpt: null,
                ticket_translation_id: null,
                ...translationCompletedEvent.data,
            })
            expect(
                result.current.secondTicketTranslations.translationMap[789],
            ).toEqual(secondExistingTranslation)
        })
    })
})
