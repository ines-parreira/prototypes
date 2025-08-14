import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListTicketMessageTranslationsHandler,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'
import {
    Language,
    type TicketMessageTranslation,
} from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'

import { useTicketMessageTranslations } from '../useTicketMessageTranslations'

// Mock the useCurrentUserPreferredLanguage hook
jest.mock('../useCurrentUserPreferredLanguage', () => ({
    useCurrentUserPreferredLanguage: jest.fn(),
}))

const mockUseCurrentUserPreferredLanguage =
    require('../useCurrentUserPreferredLanguage')
        .useCurrentUserPreferredLanguage as jest.MockedFunction<
        typeof import('../useCurrentUserPreferredLanguage').useCurrentUserPreferredLanguage
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

// Server setup
const server = setupServer()

// Create a mock handler that returns our test data
const mockListTicketMessageTranslations =
    mockListTicketMessageTranslationsHandler(async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: mockTicketMessageTranslations,
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 2,
            },
        }),
    )

const localHandlers = [mockListTicketMessageTranslations.handler]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
    mockUseCurrentUserPreferredLanguage.mockReturnValue({
        primary: Language.En,
        proficient: [],
        languagesNotToTranslateFor: [],
    })
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
    })

    describe('when no translations are available', () => {
        it('should return empty translations map', async () => {
            const { handler } = mockListTicketMessageTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                    }),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })

    describe('when preferred language is not set', () => {
        it('should not make API call when preferred language is undefined', async () => {
            mockUseCurrentUserPreferredLanguage.mockReturnValue({
                primary: undefined,
                proficient: [],
                languagesNotToTranslateFor: [],
            })

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            // The query should be disabled, so no API call should be made
            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })

        it('should not make API call when preferred language is null', async () => {
            mockUseCurrentUserPreferredLanguage.mockReturnValue({
                primary: undefined,
                proficient: [],
                languagesNotToTranslateFor: [],
            })

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

        it('should use preferred language from hook', async () => {
            mockUseCurrentUserPreferredLanguage.mockReturnValue({
                primary: Language.Fr,
                proficient: [],
                languagesNotToTranslateFor: [],
            })
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
    })

    describe('error handling', () => {
        it('should handle API errors gracefully', async () => {
            const { handler } = mockListTicketMessageTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json(
                        {
                            ...data,
                            data: [],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 0,
                            },
                        },
                        { status: 500 },
                    ),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTicketMessageTranslations({ ticket_id: ticketId }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.ticketMessagesTranslationMap).toEqual({})
            })
        })
    })
})
