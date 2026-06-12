import { act } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockRequestTicketTranslationHandler,
    mockUpdateTicketHandler,
    mockUpdateTicketResponse,
} from '@gorgias/helpdesk-mocks'
import { Language } from '@gorgias/helpdesk-types'
import type { TicketMessage } from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useCurrentUserLanguagePreferences } from '../hooks/useCurrentUserLanguagePreferences'
import { useRetranslateTicket } from '../hooks/useRetranslateTicket'
import { DisplayedContent, FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

const mockRegenerateTicketMessageTranslations = vi.fn()

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

const mockedUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)

const ticketId = 123
let mockRequestTicketTranslation: ReturnType<
    typeof mockRequestTicketTranslationHandler
>
let requestTicketTranslationCount = 0

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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useRetranslateTicket', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        requestTicketTranslationCount = 0
        mockRequestTicketTranslation = mockRequestTicketTranslationHandler(
            async () => {
                requestTicketTranslationCount += 1

                return new HttpResponse(null)
            },
        )
        server.use(
            mockUpdateTicketHandler(async () =>
                HttpResponse.json(mockUpdateTicketResponse()),
            ).handler,
            mockRequestTicketTranslation.handler,
        )
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

        mockRegenerateTicketMessageTranslations.mockResolvedValue(undefined)
    })

    it('preserves current translations while triggering subject and message retranslation', async () => {
        const waitForRequestTicketTranslationRequest =
            mockRequestTicketTranslation.waitForRequest(server)

        const { result } = renderHook(() =>
            useRetranslateTicket({
                ticketId,
                ticketMessages: translatableMessages,
            }),
        )

        await act(async () => {
            await result.current.retranslateTicket(Language.De)
        })

        await waitForRequestTicketTranslationRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                ticket_id: ticketId,
                language: Language.Fr,
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
        const updateTicketMock = mockUpdateTicketHandler(async () =>
            HttpResponse.json(mockUpdateTicketResponse()),
        )
        const waitForUpdateTicketRequest =
            updateTicketMock.waitForRequest(server)
        server.use(updateTicketMock.handler)
        mockedUseCurrentUserLanguagePreferences.mockReturnValue({
            isFetching: false,
            isEnabled: true,
            primary: Language.Fr,
            proficient: [Language.De],
            shouldShowTranslatedContent: vi.fn(),
        })

        const { result } = renderHook(() =>
            useRetranslateTicket({
                ticketId,
                ticketMessages: translatableMessages,
            }),
        )

        await act(async () => {
            await result.current.retranslateTicket(Language.De)
        })

        await waitForUpdateTicketRequest()

        expect(requestTicketTranslationCount).toBe(0)
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
