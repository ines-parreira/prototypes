import { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockRequestTicketMessageTranslationHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'

import { useRegenerateTicketMessageTranslations } from '../translations/useRegenerateTicketMessageTranslations'

const mockCurrentUserWithLanguagePrefs = {
    ...mockUser(),
    settings: [
        {
            type: UserSettingType.LanguagePreferences,
            data: {
                primary: Language.Fr,
                proficient: [Language.En],
            },
        },
    ],
}

const mockCurrentUserWithoutLanguagePrefs = {
    ...mockUser(),
    settings: [],
}

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUserWithLanguagePrefs),
)

const mockRequestTranslation = mockRequestTicketMessageTranslationHandler()

const server = setupServer()

const mockSetTicketMessageTranslationDisplay = jest.fn()
const mockGetTicketMessageTranslationDisplay = jest.fn().mockReturnValue({
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Idle,
    hasRegeneratedOnce: false,
})

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={appQueryClient}>
        <TicketMessagesTranslationDisplayContext.Provider
            value={{
                setTicketMessageTranslationDisplay:
                    mockSetTicketMessageTranslationDisplay,
                getTicketMessageTranslationDisplay:
                    mockGetTicketMessageTranslationDisplay,
            }}
        >
            {children}
        </TicketMessagesTranslationDisplayContext.Provider>
    </QueryClientProvider>
)

describe('useRegenerateTicketMessageTranslations', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockGetCurrentUser.handler, mockRequestTranslation.handler)
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
        appQueryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    describe('regenerateTicketMessageTranslations', () => {
        it('should return a function', () => {
            const { result } = renderHook(
                () => useRegenerateTicketMessageTranslations(),
                { wrapper },
            )

            expect(
                result.current.regenerateTicketMessageTranslations,
            ).toBeInstanceOf(Function)
        })

        it('should not regenerate translations when user has no language preferences', async () => {
            const mockGetCurrentUserNoLang = mockGetCurrentUserHandler(
                async () =>
                    HttpResponse.json(mockCurrentUserWithoutLanguagePrefs),
            )

            server.use(mockGetCurrentUserNoLang.handler)

            const { result } = renderHook(
                () => useRegenerateTicketMessageTranslations(),
                { wrapper },
            )

            const ticketMessageId = 101

            await act(async () => {
                await result.current.regenerateTicketMessageTranslations(
                    ticketMessageId,
                )
            })

            expect(
                mockSetTicketMessageTranslationDisplay,
            ).not.toHaveBeenCalled()
        })

        it('should maintain stable function reference', () => {
            const { result, rerender } = renderHook(
                () => useRegenerateTicketMessageTranslations(),
                { wrapper },
            )

            const firstRender =
                result.current.regenerateTicketMessageTranslations

            rerender()

            const secondRender =
                result.current.regenerateTicketMessageTranslations

            expect(firstRender).toBe(secondRender)
        })

        it('should handle function call without errors when user has language preferences', async () => {
            const { result } = renderHook(
                () => useRegenerateTicketMessageTranslations(),
                { wrapper },
            )

            const ticketMessageId = 101

            await expect(
                act(async () => {
                    await result.current.regenerateTicketMessageTranslations(
                        ticketMessageId,
                    )
                }),
            ).resolves.not.toThrow()
        })

        it('should handle API errors without throwing', async () => {
            const mockRequestTranslationFailure =
                mockRequestTicketMessageTranslationHandler(
                    async () => new HttpResponse(null, { status: 500 }),
                )

            server.use(mockRequestTranslationFailure.handler)

            const { result } = renderHook(
                () => useRegenerateTicketMessageTranslations(),
                { wrapper },
            )

            const ticketMessageId = 101

            await expect(
                act(async () => {
                    await result.current.regenerateTicketMessageTranslations(
                        ticketMessageId,
                    )
                }),
            ).resolves.not.toThrow()
        })

        it('should handle network errors without throwing', async () => {
            const mockNetworkError = mockRequestTicketMessageTranslationHandler(
                async () => {
                    throw new Error('Network error')
                },
            )

            server.use(mockNetworkError.handler)

            const { result } = renderHook(
                () => useRegenerateTicketMessageTranslations(),
                { wrapper },
            )

            const ticketMessageId = 101

            await expect(
                act(async () => {
                    await result.current.regenerateTicketMessageTranslations(
                        ticketMessageId,
                    )
                }),
            ).resolves.not.toThrow()
        })
    })
})
