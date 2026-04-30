import { act, waitFor } from '@testing-library/react'

import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'
import {
    useRequestTicketTranslation,
    useUpdateTicket,
} from '@gorgias/helpdesk-queries'
import { Language } from '@gorgias/helpdesk-types'
import type { TicketMessage } from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
import { useCurrentUserLanguagePreferences } from '../hooks/useCurrentUserLanguagePreferences'
import { useRetranslateTicket } from '../hooks/useRetranslateTicket'
import { DisplayedContent, FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

const mockRegenerateTicketMessageTranslations = vi.fn()

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useRequestTicketTranslation: vi.fn(),
        useUpdateTicket: vi.fn(),
    }
})

vi.mock('../hooks/useCurrentUserLanguagePreferences', () => ({
    useCurrentUserLanguagePreferences: vi.fn(() => ({
        isFetching: false,
        isEnabled: true,
        primary: Language.Fr,
        proficient: [],
        shouldShowTranslatedContent: vi.fn(),
    })),
}))

vi.mock('../hooks/useRegenerateTicketMessageTranslations', () => ({
    useRegenerateTicketMessageTranslations: vi.fn(() => ({
        regenerateTicketMessageTranslations:
            mockRegenerateTicketMessageTranslations,
    })),
}))

const mockedUseRequestTicketTranslation = vi.mocked(useRequestTicketTranslation)
const mockedUseUpdateTicket = vi.mocked(useUpdateTicket)
const mockedUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)

const ticketId = 123

const translatableMessages = [
    {
        id: 101,
        ticket_id: ticketId,
        body_text: 'Hello world',
        from_agent: false,
        created_datetime: '2024-01-01T10:00:00Z',
    },
    {
        id: 102,
        ticket_id: ticketId,
        body_text: 'How can I help?',
        from_agent: true,
        created_datetime: '2024-01-01T11:00:00Z',
    },
] as TicketMessage[]

describe('useRetranslateTicket', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockedUseCurrentUserLanguagePreferences.mockReturnValue({
            isFetching: false,
            isEnabled: true,
            primary: Language.Fr,
            proficient: [],
            shouldShowTranslatedContent: vi.fn(),
        })
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {
                101: {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
                102: {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
            },
            allMessageDisplayState: DisplayedContent.Translated,
        })

        mockedUseRequestTicketTranslation.mockReturnValue({
            mutate: vi.fn(),
        } as unknown as ReturnType<typeof useRequestTicketTranslation>)
        mockedUseUpdateTicket.mockReturnValue({
            mutateAsync: vi.fn().mockResolvedValue(undefined),
        } as unknown as ReturnType<typeof useUpdateTicket>)
        mockRegenerateTicketMessageTranslations.mockResolvedValue(undefined)
    })

    it('preserves current translations while triggering subject and message retranslation', async () => {
        const requestTicketTranslation = vi.fn()
        mockedUseRequestTicketTranslation.mockReturnValue({
            mutate: requestTicketTranslation,
        } as unknown as ReturnType<typeof useRequestTicketTranslation>)

        const { result } = renderHook(() =>
            useRetranslateTicket({
                ticketId,
                ticketMessages: translatableMessages,
            }),
        )

        await act(async () => {
            await result.current.retranslateTicket(Language.De)
        })

        await waitFor(() => {
            expect(requestTicketTranslation).toHaveBeenCalledWith({
                data: {
                    ticket_id: ticketId,
                    language: Language.Fr,
                },
            })
        })

        const displayState = useTicketMessageTranslationDisplay.getState()

        expect(displayState.getTicketMessageTranslationDisplay(101)).toEqual({
            messageId: 101,
            display: DisplayedContent.Translated,
            fetchingState: FetchingState.Loading,
            hasRegeneratedOnce: true,
        })
        expect(displayState.getTicketMessageTranslationDisplay(102)).toEqual({
            messageId: 102,
            display: DisplayedContent.Translated,
            fetchingState: FetchingState.Loading,
            hasRegeneratedOnce: true,
        })

        expect(mockRegenerateTicketMessageTranslations).toHaveBeenCalledWith(
            101,
        )
        expect(mockRegenerateTicketMessageTranslations).toHaveBeenCalledWith(
            102,
        )
    })

    it('does not request translations when the source language is already known by the user', async () => {
        const requestTicketTranslation = vi.fn()
        mockedUseCurrentUserLanguagePreferences.mockReturnValue({
            isFetching: false,
            isEnabled: true,
            primary: Language.Fr,
            proficient: [Language.De],
            shouldShowTranslatedContent: vi.fn(),
        })
        mockedUseRequestTicketTranslation.mockReturnValue({
            mutate: requestTicketTranslation,
        } as unknown as ReturnType<typeof useRequestTicketTranslation>)

        const { result } = renderHook(() =>
            useRetranslateTicket({
                ticketId,
                ticketMessages: translatableMessages,
            }),
        )

        await act(async () => {
            await result.current.retranslateTicket(Language.De)
        })

        expect(requestTicketTranslation).not.toHaveBeenCalled()
        expect(mockRegenerateTicketMessageTranslations).not.toHaveBeenCalled()

        const displayState = useTicketMessageTranslationDisplay.getState()

        expect(displayState.getTicketMessageTranslationDisplay(101)).toEqual({
            display: DisplayedContent.Translated,
            fetchingState: FetchingState.Completed,
            hasRegeneratedOnce: false,
        })
        expect(displayState.getTicketMessageTranslationDisplay(102)).toEqual({
            display: DisplayedContent.Translated,
            fetchingState: FetchingState.Completed,
            hasRegeneratedOnce: false,
        })
    })
})
