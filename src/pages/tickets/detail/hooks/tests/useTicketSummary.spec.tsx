import { act } from '@testing-library/react'

import { useGenerateTicketSummary } from '@gorgias/api-queries'

import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTicketSummary } from '../useTicketSummary'

const mockSetTimeout = jest.fn()
jest.mock('hooks/useTimeout', () => ({
    useTimeout: () => [mockSetTimeout],
}))

jest.mock('@gorgias/api-queries', () => ({
    useGenerateTicketSummary: jest.fn(),
}))

const useGenerateTicketSummaryMock = assumeMock(useGenerateTicketSummary)
const mutate = jest.fn()

const mockSummary = {
    content: 'Sample summary',
    created_datetime: '2024-01-01T12:00:00Z',
    updated_datetime: '2024-01-02T12:00:00Z',
    triggered_by: 1,
}

describe('useTicketSummary', () => {
    beforeEach(() => {
        useGenerateTicketSummaryMock.mockReturnValue({
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
        expect(result.current.hasRequested).toBe(true)
    })

    it('should call mutate when requestSummary is triggered manually', async () => {
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
        expect(result.current.hasRequested).toBe(true)
    })

    it('should automatically fetch if generateOnMountIfMissing is true and no summary is passed', async () => {
        renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
                generateOnMountIfMissing: true,
            }),
        )

        expect(mutate).toHaveBeenCalledWith(
            { ticketId: 1, data: {} },
            expect.objectContaining({ onError: expect.any(Function) }),
        )
    })

    it('should set errorMessage if mutate fails with 400 error', async () => {
        const error = {
            status: 400,
            response: {
                data: {
                    error: {
                        msg: 'Custom error',
                    },
                },
            },
        }

        mutate.mockImplementation((_: any, { onError }: any) => {
            onError?.(error)
        })

        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: null,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        expect(result.current.errorMessage).toBe('Custom error')
        expect(result.current.isLoading).toBe(false)
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
        const error = {
            status: 400,
            response: {
                data: {
                    error: {
                        msg: 'Temporary error',
                    },
                },
            },
        }

        mutate.mockImplementation((_: any, { onError }: any) => {
            onError?.(error)
        })

        const { result } = renderHook(() =>
            useTicketSummary({
                ticketId: 1,
                initialSummary: mockSummary,
            }),
        )

        await act(async () => {
            result.current.requestSummary()
        })

        expect(result.current.errorMessage).toBe('Temporary error')

        const timeoutCallback = mockSetTimeout.mock.calls[0][0]
        act(() => {
            timeoutCallback()
        })

        expect(result.current.errorMessage).toBe('')
    })
})
