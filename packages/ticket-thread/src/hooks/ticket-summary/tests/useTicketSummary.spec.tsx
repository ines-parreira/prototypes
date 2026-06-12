import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockGenerateTicketSummaryHandler } from '@gorgias/helpdesk-mocks'

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

import { useTicketSummary } from '../useTicketSummary'

const mockSummary = {
    content: 'Sample summary',
    created_datetime: '2024-01-01T12:00:00Z',
    updated_datetime: '2024-01-02T12:00:00Z',
    triggered_by: 1,
}

describe('useTicketSummary', () => {
    beforeEach(() => {
        server.use(
            mockGenerateTicketSummaryHandler(
                async () => new HttpResponse(null, { status: 204 }),
            ).handler,
        )
    })

    it('should initialize with initialSummary', () => {
        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: mockSummary,
            }),
        )

        expect(result.current.summary).toEqual(mockSummary)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.errorMessage).toBe('')
        expect(result.current.isRetriable).toBe(true)
    })

    it('should call mutate when requestSummary is triggered', async () => {
        const generateTicketSummaryMock = mockGenerateTicketSummaryHandler(
            async () => new HttpResponse(null, { status: 204 }),
        )
        const waitForGenerateTicketSummaryRequest =
            generateTicketSummaryMock.waitForRequest(server)
        server.use(generateTicketSummaryMock.handler)
        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        await waitForGenerateTicketSummaryRequest(async (request) => {
            expect(new URL(request.url).pathname).toContain(
                '/api/tickets/1/summarize',
            )
            expect(await request.json()).toEqual({})
        })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.errorMessage).toBe('')
        expect(result.current.isRetriable).toBe(true)
    })

    it('should set errorMessage if mutate fails with 400 error', async () => {
        server.use(
            mockGenerateTicketSummaryHandler(async () =>
                HttpResponse.json({ error: { msg: 'Custom error' } } as any, {
                    status: 400,
                }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useTicketSummary({ ticketId: 1, initialSummary: null }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        await waitFor(() => {
            expect(result.current.errorMessage).toBe('Custom error')
            expect(result.current.isRetriable).toBe(true)
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should set isRetriable to false when error status is 403', async () => {
        server.use(
            mockGenerateTicketSummaryHandler(async () =>
                HttpResponse.json({ error: { msg: 'Forbidden' } } as any, {
                    status: 403,
                }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useTicketSummary({ ticketId: 1, initialSummary: null }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        await waitFor(() => {
            expect(result.current.errorMessage).toBe('Forbidden')
            expect(result.current.isRetriable).toBe(false)
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should update summary when initialSummary changes externally', () => {
        const { result, rerender } = renderHook(
            ({ initialSummary }) =>
                useTicketSummary({ ticketId: 1, initialSummary }),
            { initialProps: { initialSummary: null } },
        )

        expect(result.current.summary).toBe(null)

        rerender({
            initialSummary: {
                ...mockSummary,
                updated_datetime: '2024-02-01T00:00:00Z',
            },
        } as never)

        expect(result.current.summary).toEqual({
            ...mockSummary,
            updated_datetime: '2024-02-01T00:00:00Z',
        })
        expect(result.current.isLoading).toBe(false)
        expect(result.current.errorMessage).toBe('')
    })

    it('should update summary when initialSummary arrives without updated_datetime', () => {
        const { result, rerender } = renderHook(
            ({ initialSummary }) =>
                useTicketSummary({ ticketId: 1, initialSummary }),
            { initialProps: { initialSummary: undefined } },
        )

        expect(result.current.summary).toBeUndefined()

        rerender({
            initialSummary: {
                ...mockSummary,
                updated_datetime: null,
            },
        } as never)

        expect(result.current.summary).toEqual({
            ...mockSummary,
            updated_datetime: null,
        })
    })
})
