import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockGenerateTicketSummaryHandler } from '@gorgias/helpdesk-mocks'

import { useTicketSummary } from '../useTicketSummary'

const mockSetTimeout = jest.fn()
jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useTimeout: () => [mockSetTimeout],
}))

const server = setupServer()

const mockSummary = {
    content: 'Sample summary',
    created_datetime: '2024-01-01T12:00:00Z',
    updated_datetime: '2024-01-02T12:00:00Z',
    triggered_by: 1,
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTicketSummary', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        server.use(mockGenerateTicketSummaryHandler().handler)
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
        expect(result.current.hasRequested).toBe(true)
    })

    it('should call mutate when requestSummary is triggered manually', async () => {
        const generateSummaryMock = mockGenerateTicketSummaryHandler()
        server.use(generateSummaryMock.handler)
        const waitForGenerateSummaryRequest =
            generateSummaryMock.waitForRequest(server)

        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        await waitForGenerateSummaryRequest(async (request) => {
            expect(request.url).toContain('/api/tickets/1/summarize')
            expect(await request.json()).toEqual({})
        })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.errorMessage).toBe('')
        expect(result.current.isRetriable).toBe(true)
        expect(result.current.hasRequested).toBe(true)
    })

    it('should automatically fetch if generateOnMountIfMissing is true and no summary is passed', async () => {
        const generateSummaryMock = mockGenerateTicketSummaryHandler()
        server.use(generateSummaryMock.handler)
        const waitForGenerateSummaryRequest =
            generateSummaryMock.waitForRequest(server)

        renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
                generateOnMountIfMissing: true,
            }),
        )

        await waitForGenerateSummaryRequest((request) => {
            expect(request.url).toContain('/api/tickets/1/summarize')
        })
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
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
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

    it('should update summary and reset loading/error when initialSummary changes externally', () => {
        const { result, rerender } = renderHook(
            ({ initialSummary }) =>
                useTicketSummary({
                    ticketId: 1,
                    initialSummary,
                }),
            {
                initialProps: { initialSummary: null },
            },
        )

        expect(result.current.summary).toBe(null)

        const newSummary = {
            ...mockSummary,
            updated_datetime: '2024-02-01T00:00:00Z',
        }

        rerender({ initialSummary: newSummary } as any)

        expect(result.current.summary).toEqual(newSummary)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.errorMessage).toBe('')
    })

    it('should clear error message after timeout if summary has content', async () => {
        server.use(
            mockGenerateTicketSummaryHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'Temporary error' } } as any,
                    { status: 400 },
                ),
            ).handler,
        )

        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: mockSummary,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        await waitFor(() => {
            expect(result.current.errorMessage).toBe('Temporary error')
        })

        const timeoutCallback = mockSetTimeout.mock.calls[0][0]
        act(() => {
            timeoutCallback()
        })

        expect(result.current.errorMessage).toBe('')
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
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
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

    it('should set isRetriable to true when error status is not 403', async () => {
        server.use(
            mockGenerateTicketSummaryHandler(async () =>
                HttpResponse.json({ error: { msg: 'Bad request' } } as any, {
                    status: 400,
                }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        await waitFor(() => {
            expect(result.current.errorMessage).toBe('Bad request')
            expect(result.current.isRetriable).toBe(true)
            expect(result.current.isLoading).toBe(false)
        })
    })
})
