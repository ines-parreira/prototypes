import React from 'react'

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
import {
    Language,
    type TicketMessageTranslation,
    UserSettingType,
} from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'

import { useTicketMessageTranslation } from '../translations/useTicketMessageTranslation'

// Mock the feature flag hook
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = require('core/flags').useFlag as jest.MockedFunction<
    typeof import('core/flags').useFlag
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

// Server setup
const server = setupServer()

// Create mock handlers
const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUser),
)

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={appQueryClient}>
        {children}
    </QueryClientProvider>
)
describe('useTicketMessageTranslation', () => {
    it('should return undefined when messageId is not provided', async () => {
        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: 123,
                    messageId: undefined,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should return undefined when messageId is not in the translation map', async () => {
        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: 123,
                    messageId: 456,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should return translation when messageId exists in the translation map', async () => {
        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: 123,
                    messageId: 101,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toEqual(mockTicketMessageTranslations[0])
        })
    })

    it('should handle empty translation map', async () => {
        const { handler } = mockListTicketMessageTranslationsHandler(async () =>
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
            () =>
                useTicketMessageTranslation({
                    ticketId: 123,
                    messageId: 123,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should handle undefined ticketId by not making API call', async () => {
        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: undefined,
                    messageId: 123,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should handle null ticketId by not making API call', async () => {
        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: null as any,
                    messageId: 123,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should make API call with correct ticketId', async () => {
        const waitForRequest =
            mockListTicketMessageTranslations.waitForRequest(server)

        renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: 42,
                    messageId: 123,
                }),
            { wrapper },
        )

        await waitForRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('ticket_id')).toBe('42')
            expect(url.searchParams.get('language')).toBe('en')
        })
    })

    it('should memoize the result based on messageId and translation map', async () => {
        const { result, rerender } = renderHook(
            ({ ticketId, messageId }) =>
                useTicketMessageTranslation({
                    ticketId,
                    messageId,
                }),
            {
                wrapper,
                initialProps: {
                    ticketId: 123,
                    messageId: 101,
                },
            },
        )

        await waitFor(() => {
            expect(result.current).toEqual(mockTicketMessageTranslations[0])
        })

        const firstResult = result.current

        // Rerender with same props
        rerender({ ticketId: 123, messageId: 101 })

        expect(result.current).toBe(firstResult)
    })

    it('should update result when messageId changes', async () => {
        const { result, rerender } = renderHook(
            ({ ticketId, messageId }) =>
                useTicketMessageTranslation({
                    ticketId,
                    messageId,
                }),
            {
                wrapper,
                initialProps: {
                    ticketId: 123,
                    messageId: 101,
                },
            },
        )

        await waitFor(() => {
            expect(result.current).toEqual(mockTicketMessageTranslations[0])
        })

        // Change to a messageId in the map
        rerender({ ticketId: 123, messageId: 102 })

        await waitFor(() => {
            expect(result.current).toEqual(mockTicketMessageTranslations[1])
        })

        // Change to a messageId not in the map
        rerender({ ticketId: 123, messageId: 456 })

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })

        // Change to undefined messageId
        // @ts-expect-error - messageId is optional
        rerender({ ticketId: 123 })

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should handle feature flag disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: 123,
                    messageId: 101,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should handle API errors gracefully', async () => {
        const { handler } = mockListTicketMessageTranslationsHandler(async () =>
            HttpResponse.json(null, { status: 500 }),
        )
        server.use(mockGetCurrentUser.handler, handler)

        const { result } = renderHook(
            () =>
                useTicketMessageTranslation({
                    ticketId: 123,
                    messageId: 101,
                }),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })
})
