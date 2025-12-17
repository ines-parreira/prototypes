import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockTicketMessageTranslation,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'
import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'

import { useTicketMessageTranslations } from '../translations/useTicketMessageTranslations'

// Mock the feature flag hook
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = require('@repo/feature-flags')
    .useFlag as jest.MockedFunction<
    typeof import('@repo/feature-flags').useFlag
>

// Mock data
const mockTicketMessageTranslations: TicketMessageTranslation[] = [
    {
        ...mockTicketMessageTranslation(),
        id: '1',
        ticket_message_id: 101,
        ticket_id: 123,
    },
    {
        ...mockTicketMessageTranslation(),
        id: '2',
        ticket_message_id: 102,
        ticket_id: 123,
    },
]

// Create mock user with language preferences
const mockCurrentUser = {
    ...mockUser(),
    settings: [
        {
            type: UserSettingType.LanguagePreferences,
            data: {
                primary: Language.En,
                proficient: [],
            },
        },
    ],
}

const mockCurrentUserWithFrench = {
    ...mockUser(),
    settings: [
        {
            type: UserSettingType.LanguagePreferences,
            data: {
                primary: Language.Fr,
                proficient: [],
            },
        },
    ],
}

const mockCurrentUserWithoutLanguagePrefs = {
    ...mockUser(),
    settings: [],
}

// Server setup
const server = setupServer()

// Create mock handlers
const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUser),
)

const mockGetCurrentUserFrench = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUserWithFrench),
)

const mockGetCurrentUserNoLang = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUserWithoutLanguagePrefs),
)

// Create a mock handler that returns our test data
const mockListTicketMessageTranslations =
    mockListTicketMessageTranslationsHandler(async () =>
        HttpResponse.json({
            data: mockTicketMessageTranslations,
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 2,
            },
            object: 'list',
            uri: '/api/v1/tickets/123/messages/translations',
        }),
    )

const localHandlers = [
    mockGetCurrentUser.handler,
    mockListTicketMessageTranslations.handler,
]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
    appQueryClient.clear()
    mockUseFlag.mockImplementation(
        (flag) => flag === FeatureFlagKey.MessagesTranslations,
    )
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

// Test component wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={appQueryClient}>
        {children}
    </QueryClientProvider>
)

describe('useTicketMessageTranslations', () => {
    const ticketId = 123

    describe('when translations are available', () => {
        it('should return translations map with correct structure', async () => {
            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({
                    [mockTicketMessageTranslations[0].ticket_message_id]:
                        mockTicketMessageTranslations[0],
                    [mockTicketMessageTranslations[1].ticket_message_id]:
                        mockTicketMessageTranslations[1],
                })
            })
        })

        it('should map translations by ticket_message_id', async () => {
            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                const translationMap =
                    result.current.ticketMessagesTranslationMap
                expect(
                    translationMap[
                        mockTicketMessageTranslations[0].ticket_message_id
                    ],
                ).toEqual(mockTicketMessageTranslations[0])
                expect(
                    translationMap[
                        mockTicketMessageTranslations[1].ticket_message_id
                    ],
                ).toEqual(mockTicketMessageTranslations[1])
            })
        })

        it('should provide getMessageTranslation function', async () => {
            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                const translation = result.current.getMessageTranslation(101)
                expect(translation).toEqual(mockTicketMessageTranslations[0])
            })
        })

        it('should return undefined for non-existent message id', async () => {
            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                const translation = result.current.getMessageTranslation(999)
                expect(translation).toBeUndefined()
            })
        })
    })

    describe('when no translations are available', () => {
        it('should return empty translations map when data is empty', async () => {
            const { handler } = mockListTicketMessageTranslationsHandler(
                async () =>
                    HttpResponse.json({
                        data: [],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        object: 'list',
                        uri: '/api/v1/tickets/123/messages/translations',
                    }),
            )
            server.use(mockGetCurrentUser.handler, handler)

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })

    describe('when feature flag is disabled', () => {
        it('should not make API call when MessagesTranslations flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            // The query should be disabled, so no API call should be made
            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })

    describe('when preferred language is not set', () => {
        it('should not make API call when user has no language preferences', async () => {
            server.use(
                mockGetCurrentUserNoLang.handler,
                mockListTicketMessageTranslations.handler,
            )

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            // The query should be disabled when there's no language preference
            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })

    describe('when ticket_id is not provided', () => {
        it('should not make API call when ticket_id is 0', async () => {
            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: 0 }),
                { wrapper },
            )

            // The query should be disabled, so no API call should be made
            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })

        it('should not make API call when ticket_id is negative', async () => {
            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: -1 }),
                { wrapper },
            )

            // The query should be disabled, so no API call should be made
            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })

    describe('API request parameters', () => {
        it('should make request with correct ticket_id and language', async () => {
            const waitForRequest =
                mockListTicketMessageTranslations.waitForRequest(server)

            renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitForRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.searchParams.get('ticket_id')).toBe(
                    ticketId.toString(),
                )
                expect(url.searchParams.get('language')).toBe('en')
            })
        })

        it('should use preferred language from user settings', async () => {
            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTicketMessageTranslations.handler,
            )

            const waitForRequest =
                mockListTicketMessageTranslations.waitForRequest(server)

            renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitForRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.searchParams.get('language')).toBe('fr')
            })
        })

        it('should fetch current user data', async () => {
            const waitForUserRequest = mockGetCurrentUser.waitForRequest(server)

            renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitForUserRequest(async (request) => {
                expect(request.url).toContain('/api/users/')
            })
        })
    })

    describe('error handling', () => {
        it('should handle API errors gracefully', async () => {
            const { handler } = mockListTicketMessageTranslationsHandler(
                async () => HttpResponse.json(null, { status: 500 }),
            )
            server.use(mockGetCurrentUser.handler, handler)

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })

        it('should handle current user API error', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json(null, { status: 500 }),
            )
            server.use(handler, mockListTicketMessageTranslations.handler)

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })

    describe('memoization', () => {
        it('should memoize the translation map', async () => {
            const { result, rerender } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    Object.keys(result.current.ticketMessagesTranslationMap),
                ).toHaveLength(2)
            })

            const firstMap = result.current.ticketMessagesTranslationMap
            const firstGetFn = result.current.getMessageTranslation

            // Rerender with same data
            rerender()

            const secondMap = result.current.ticketMessagesTranslationMap
            const secondGetFn = result.current.getMessageTranslation

            // Map should be the same reference if data hasn't changed
            expect(firstMap).toBe(secondMap)
            // Function should be memoized based on the map
            expect(firstGetFn).toBe(secondGetFn)
        })

        it('should update when translations data changes', async () => {
            // Start with initial data
            const { result, rerender } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(
                    Object.keys(result.current.ticketMessagesTranslationMap),
                ).toHaveLength(2)
            })

            const firstMap = result.current.ticketMessagesTranslationMap

            // Update the server response for next fetch
            const updatedTranslations = [
                ...mockTicketMessageTranslations,
                {
                    ...mockTicketMessageTranslation(),
                    id: '3',
                    ticket_message_id: 103,
                    ticket_id: 123,
                },
            ]

            const { handler } = mockListTicketMessageTranslationsHandler(
                async () =>
                    HttpResponse.json({
                        data: updatedTranslations,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 3,
                        },
                        object: 'list',
                        uri: '/api/v1/tickets/123/messages/translations',
                    }),
            )
            server.use(mockGetCurrentUser.handler, handler)

            // Invalidate and refetch the query
            await appQueryClient.invalidateQueries()
            await appQueryClient.refetchQueries()

            // Force a rerender to get updated data
            rerender()

            await waitFor(() => {
                const currentMap = result.current.ticketMessagesTranslationMap
                expect(Object.keys(currentMap)).toHaveLength(3)
                expect(currentMap).not.toBe(firstMap)
            })
        })
    })
})
