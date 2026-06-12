import type * as TicketsModule from '@repo/tickets'
import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'

import { HttpResponse } from 'msw'
import {
    mockGetTicketHandler,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadRegularMessageItem } from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { useDisplayedTicketMessage } from './useDisplayedTicketMessage'

vi.mock('@repo/tickets', async () => {
    const actual = await vi.importActual<typeof TicketsModule>('@repo/tickets')
    return {
        ...actual,
        useCurrentUserLanguagePreferences: vi.fn(),
        useTicketMessageTranslations: vi.fn(),
        useTicketMessageDisplayState: vi.fn(),
    }
})

const mockUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)
const mockUseTicketMessageDisplayState = vi.mocked(useTicketMessageDisplayState)
const mockUseTicketMessageTranslations = vi.mocked(useTicketMessageTranslations)

const message = mockTicketMessage({
    id: 42,
    ticket_id: 99,
    body_text: 'Original message body',
})

function makeItem(): TicketThreadRegularMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: message as TicketThreadRegularMessageItem['data'],
        datetime: message.created_datetime,
    }
}

describe('useDisplayedTicketMessage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        server.use(
            mockGetTicketHandler(async () =>
                HttpResponse.json(mockTicket({ id: 99, language: 'fr' })),
            ).handler,
        )
        mockUseCurrentUserLanguagePreferences.mockReturnValue({
            shouldShowTranslatedContent: () => false,
        } as ReturnType<typeof useCurrentUserLanguagePreferences>)
        mockUseTicketMessageTranslations.mockReturnValue({
            getMessageTranslation: vi.fn(),
        } as unknown as ReturnType<typeof useTicketMessageTranslations>)
        mockUseTicketMessageDisplayState.mockReturnValue({
            display: DisplayedContent.Original,
        } as ReturnType<typeof useTicketMessageDisplayState>)
    })

    it('returns the original item when translated content should not be shown', () => {
        const item = makeItem()

        const { result } = renderHook(() => useDisplayedTicketMessage({ item }))

        expect(result.current).toBe(item)
    })

    it('adds the selected translation when translated content is displayed', () => {
        const item = makeItem()
        const translation = mockTicketMessageTranslation({
            ticket_message_id: 42,
            stripped_text: 'Translated message body',
        })
        mockUseCurrentUserLanguagePreferences.mockReturnValue({
            shouldShowTranslatedContent: () => true,
        } as ReturnType<typeof useCurrentUserLanguagePreferences>)
        mockUseTicketMessageDisplayState.mockReturnValue({
            display: DisplayedContent.Translated,
        } as ReturnType<typeof useTicketMessageDisplayState>)
        mockUseTicketMessageTranslations.mockReturnValue({
            getMessageTranslation: () => translation,
        } as unknown as ReturnType<typeof useTicketMessageTranslations>)

        const { result } = renderHook(() => useDisplayedTicketMessage({ item }))

        expect(result.current).not.toBe(item)
        expect(result.current.data.translations).toBe(translation)
    })

    it('keeps the original item when translations exist but original display is selected', () => {
        const item = makeItem()
        mockUseCurrentUserLanguagePreferences.mockReturnValue({
            shouldShowTranslatedContent: () => true,
        } as ReturnType<typeof useCurrentUserLanguagePreferences>)
        mockUseTicketMessageTranslations.mockReturnValue({
            getMessageTranslation: () =>
                mockTicketMessageTranslation({ ticket_message_id: 42 }),
        } as unknown as ReturnType<typeof useTicketMessageTranslations>)

        const { result } = renderHook(() => useDisplayedTicketMessage({ item }))

        expect(result.current).toBe(item)
    })
})
