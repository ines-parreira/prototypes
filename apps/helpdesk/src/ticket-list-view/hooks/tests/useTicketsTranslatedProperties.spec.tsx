import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { act } from 'react-dom/test-utils'

import {
    mockGetCurrentUserHandler,
    mockListTicketTranslationsHandler,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import { UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { useFlag } from 'core/flags'

import {
    CurrentUser,
    useTicketsTranslatedProperties,
} from '../useTicketsTranslatedProperties'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const server = setupServer()

const preferences = {
    id: 1,
    type: UserSettingType.Preferences,
    data: {
        available: true,
        date_format: 'en_GB',
        time_format: '24-hour',
        prefill_best_macro: false,
        show_macros: false,
        show_macros_suggestions: true,
    },
}

const languagePreferences = {
    id: 1,
    type: UserSettingType.LanguagePreferences,
    data: {
        primary: 'en',
        proficient: [],
    },
}

const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [preferences, languagePreferences],
    } as CurrentUser['data']),
)
const mockListTicketTranslations = mockListTicketTranslationsHandler()

const localHandlers = [
    mockGetCurrentUser.handler,
    mockListTicketTranslations.handler,
]

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={appQueryClient}>
        {children}
    </QueryClientProvider>
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
    mockUseFlag.mockClear()
    appQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useTicketsTranslatedProperties', () => {
    describe('when feature flag is disabled', () => {
        it('should return empty translation map', async () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [1, 2] }),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(result.current.translationMap).toEqual({})
            })
        })
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return empty translation map when ticket_ids is empty', async () => {
            const { result } = renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [] }),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(result.current.translationMap).toEqual({})
            })
        })

        it('should fetch and return translations when user has language preferences', async () => {
            const mockTranslation = mockTicketTranslationCompact()
            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation],
                    }),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(result.current.translationMap).toEqual({
                    123: mockTranslation,
                })
            })
        })

        it('should use fallback language when user has no language preferences', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    language: 'en',
                    settings: [],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const waitForListTicketTranslationsRequest =
                mockListTicketTranslations.waitForRequest(server)

            renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [1] }),
                {
                    wrapper,
                },
            )

            await waitForListTicketTranslationsRequest(async (request) => {
                const url = new URL(request.url)
                const ticketIds = url.searchParams.get('ticket_ids')
                expect(ticketIds).toBe('1')
                const language = url.searchParams.get('language')
                expect(language).toBe('en')
            })
        })

        it('should handle API errors gracefully', async () => {
            const { handler } = mockListTicketTranslationsHandler(
                async () => new HttpResponse(null, { status: 500 }),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                {
                    wrapper,
                },
            )

            // Should return empty translation map on error
            await waitFor(() => {
                expect(result.current.translationMap).toEqual({})
            })
        })

        it('should handle empty API response', async () => {
            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [],
                    }),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(result.current.translationMap).toEqual({})
            })
        })

        it('should handle multiple tickets with translations', async () => {
            const mockTranslation1 = mockTicketTranslationCompact()
            const mockTranslation2 = {
                ...mockTicketTranslationCompact(),
                ticket_id: 456,
                ticket_translation_id: '456-translation',
                subject: 'Translated subject 2',
                excerpt: 'Translated excerpt 2',
            }

            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [mockTranslation1, mockTranslation2],
                    }),
            )
            server.use(handler)

            const { result } = renderHook(
                () =>
                    useTicketsTranslatedProperties({ ticket_ids: [123, 456] }),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(result.current.translationMap).toEqual({
                    123: mockTranslation1,
                    456: mockTranslation2,
                })
            })
        })

        it('should not fetch when preferred language is undefined', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    language: undefined,
                    settings: [],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                {
                    wrapper,
                },
            )

            await waitFor(() => {
                expect(result.current.translationMap).toEqual({})
            })
        })

        describe('removeTicketTranslatedSubject', () => {
            it('should provide removeTicketTranslatedSubject function', async () => {
                const { result } = renderHook(
                    () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(
                        typeof result.current.removeTicketTranslatedSubject,
                    ).toBe('function')
                })
            })

            it('should optimistically update specific ticket subject in cache', async () => {
                const mockTranslation1 = mockTicketTranslationCompact()
                const mockTranslation2 = {
                    ...mockTicketTranslationCompact(),
                    ticket_id: 456,
                    ticket_translation_id: '456-translation',
                }

                const { handler } = mockListTicketTranslationsHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [mockTranslation1, mockTranslation2],
                        }),
                )
                server.use(handler)

                const { result } = renderHook(
                    () =>
                        useTicketsTranslatedProperties({
                            ticket_ids: [123, 456],
                        }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({
                        123: mockTranslation1,
                        456: mockTranslation2,
                    })
                })

                act(() => {
                    result.current.removeTicketTranslatedSubject(123)
                })

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({
                        123: {
                            ...mockTranslation1,
                            subject: null,
                        },
                        456: mockTranslation2,
                    })
                })
            })

            it('should handle optimistic update when no translations exist in cache', async () => {
                const { result } = renderHook(
                    () => useTicketsTranslatedProperties({ ticket_ids: [] }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({})
                })

                expect(() => {
                    act(() => {
                        result.current.removeTicketTranslatedSubject(123)
                    })
                }).not.toThrow()

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({})
                })
            })

            it('should handle optimistic update for non-existent ticket ID', async () => {
                const mockTranslation = mockTicketTranslationCompact()

                const { handler } = mockListTicketTranslationsHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [mockTranslation],
                        }),
                )
                server.use(handler)

                const { result } = renderHook(
                    () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({
                        123: mockTranslation,
                    })
                })

                act(() => {
                    result.current.removeTicketTranslatedSubject(999)
                })

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({
                        123: mockTranslation,
                    })
                })
            })

            it('should handle multiple optimistic subject updates', async () => {
                const mockTranslation1 = mockTicketTranslationCompact()
                const mockTranslation2 = {
                    ...mockTicketTranslationCompact(),
                    ticket_id: 456,
                    ticket_translation_id: '456-translation',
                }
                const mockTranslation3 = {
                    ...mockTicketTranslationCompact(),
                    ticket_id: 789,
                    ticket_translation_id: '789-translation',
                }

                const { handler } = mockListTicketTranslationsHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [
                                mockTranslation1,
                                mockTranslation2,
                                mockTranslation3,
                            ],
                        }),
                )
                server.use(handler)

                const { result } = renderHook(
                    () =>
                        useTicketsTranslatedProperties({
                            ticket_ids: [123, 456, 789],
                        }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({
                        123: mockTranslation1,
                        456: mockTranslation2,
                        789: mockTranslation3,
                    })
                })

                act(() => {
                    result.current.removeTicketTranslatedSubject(123)
                })

                act(() => {
                    result.current.removeTicketTranslatedSubject(789)
                })

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({
                        123: {
                            ...mockTranslation1,
                            subject: null,
                        },
                        456: mockTranslation2,
                        789: {
                            ...mockTranslation3,
                            subject: null,
                        },
                    })
                })
            })
        })

        describe('query enablement conditions', () => {
            it('should not fetch when ticket_ids array is empty even with valid language', async () => {
                let requestMade = false
                const { handler } = mockListTicketTranslationsHandler(
                    async ({ data }) => {
                        requestMade = true
                        return HttpResponse.json({
                            ...data,
                            data: [],
                        })
                    },
                )
                server.use(handler)

                const { result } = renderHook(
                    () => useTicketsTranslatedProperties({ ticket_ids: [] }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({})
                })

                expect(requestMade).toBe(false)
            })

            it('should not fetch when feature flag is enabled but no preferred language', async () => {
                const { handler } = mockGetCurrentUserHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            language: undefined,
                            settings: [],
                        } as CurrentUser['data']),
                )
                server.use(handler)

                let requestMade = false
                const translationHandler = mockListTicketTranslationsHandler(
                    async ({ data }) => {
                        requestMade = true
                        return HttpResponse.json({
                            ...data,
                            data: [],
                        })
                    },
                )
                server.use(translationHandler.handler)

                const { result } = renderHook(
                    () => useTicketsTranslatedProperties({ ticket_ids: [123] }),
                    {
                        wrapper,
                    },
                )

                await waitFor(() => {
                    expect(result.current.translationMap).toEqual({})
                })

                expect(requestMade).toBe(false)
            })
        })
    })
})
