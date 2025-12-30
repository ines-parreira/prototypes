import { act } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockRequestTicketMessageTranslationHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useRegenerateTicketMessageTranslations } from '../hooks/useRegenerateTicketMessageTranslations'
import { DisplayedContent } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

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

const mockSetTicketMessageTranslationDisplay = vi.fn()

describe('useRegenerateTicketMessageTranslations', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
        // Spy on the zustand store's setter
        vi.spyOn(
            useTicketMessageTranslationDisplay.getState(),
            'setTicketMessageTranslationDisplay',
        ).mockImplementation(mockSetTicketMessageTranslationDisplay)
    })

    beforeEach(() => {
        vi.clearAllMocks()
        mockSetTicketMessageTranslationDisplay.mockClear()
        // Reset zustand store
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {},
            allMessageDisplayState: DisplayedContent.Translated,
        })
        server.use(mockGetCurrentUser.handler, mockRequestTranslation.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        testAppQueryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    describe('regenerateTicketMessageTranslations', () => {
        it('should return a function', () => {
            const { result } = renderHook(() =>
                useRegenerateTicketMessageTranslations(),
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

            const { result } = renderHook(() =>
                useRegenerateTicketMessageTranslations(),
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
            const { result, rerender } = renderHook(() =>
                useRegenerateTicketMessageTranslations(),
            )

            const firstRender =
                result.current.regenerateTicketMessageTranslations

            rerender()

            const secondRender =
                result.current.regenerateTicketMessageTranslations

            expect(firstRender).toBe(secondRender)
        })

        it('should handle function call without errors when user has language preferences', async () => {
            const { result } = renderHook(() =>
                useRegenerateTicketMessageTranslations(),
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

            const { result } = renderHook(() =>
                useRegenerateTicketMessageTranslations(),
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

            const { result } = renderHook(() =>
                useRegenerateTicketMessageTranslations(),
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
