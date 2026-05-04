import { act } from '@testing-library/react'

import type * as HelpdeskQueries from '@gorgias/helpdesk-queries'
import { useGenerateTicketSummary } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../tests/render.utils'
import { useTicketSummary } from '../useTicketSummary'

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueries>()
    return {
        ...actual,
        useGenerateTicketSummary: vi.fn(),
    }
})

const mutate = vi.fn()

const mockSummary = {
    content: 'Sample summary',
    created_datetime: '2024-01-01T12:00:00Z',
    updated_datetime: '2024-01-02T12:00:00Z',
    triggered_by: 1,
}

describe('useTicketSummary', () => {
    beforeEach(() => {
        vi.mocked(useGenerateTicketSummary).mockReturnValue({
            mutate,
        } as unknown as ReturnType<typeof useGenerateTicketSummary>)
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
        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        expect(mutate).toHaveBeenCalledWith(
            { ticketId: 1, data: {} },
            expect.objectContaining({ onError: expect.any(Function) }),
        )
        expect(result.current.isLoading).toBe(true)
        expect(result.current.errorMessage).toBe('')
        expect(result.current.isRetriable).toBe(true)
    })

    it('should set errorMessage if mutate fails with 400 error', async () => {
        const error = {
            response: {
                status: 400,
                data: { error: { msg: 'Custom error' } },
            },
        }

        mutate.mockImplementation(
            (_: unknown, { onError }: { onError: (e: unknown) => void }) => {
                onError?.(error)
            },
        )

        const { result } = renderHook(() =>
            useTicketSummary({ ticketId: 1, initialSummary: null }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        expect(result.current.errorMessage).toBe('Custom error')
        expect(result.current.isRetriable).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('should set isRetriable to false when error status is 403', async () => {
        const error = {
            response: {
                status: 403,
                data: { error: { msg: 'Forbidden' } },
            },
        }

        mutate.mockImplementation(
            (_: unknown, { onError }: { onError: (e: unknown) => void }) => {
                onError?.(error)
            },
        )

        const { result } = renderHook(() =>
            useTicketSummary({ ticketId: 1, initialSummary: null }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        expect(result.current.errorMessage).toBe('Forbidden')
        expect(result.current.isRetriable).toBe(false)
        expect(result.current.isLoading).toBe(false)
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
})
