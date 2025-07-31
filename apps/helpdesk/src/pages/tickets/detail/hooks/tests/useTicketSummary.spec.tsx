import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useGenerateTicketSummary } from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'
import { assumeMock } from 'utils/testing'

import { useTicketSummary } from '../useTicketSummary'

const mockSetTimeout = jest.fn()
jest.mock('hooks/useTimeout', () => ({
    useTimeout: () => [mockSetTimeout],
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGenerateTicketSummary: jest.fn(),
}))

jest.mock('models/api/types', () => ({
    isGorgiasApiError: jest.fn(),
}))

const useGenerateTicketSummaryMock = assumeMock(useGenerateTicketSummary)
const isGorgiasApiErrorMock = assumeMock(isGorgiasApiError)
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
        isGorgiasApiErrorMock.mockReturnValue(true)
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
        expect(result.current.isRetriable).toBe(true)
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

    it('should set isRetriable to false when error status is 403', async () => {
        const error = {
            status: 403,
            response: {
                data: {
                    error: {
                        msg: 'Forbidden',
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

        expect(result.current.errorMessage).toBe('Forbidden')
        expect(result.current.isRetriable).toBe(false)
        expect(result.current.isLoading).toBe(false)
    })

    it('should set isRetriable to true when error status is not 403', async () => {
        const error = {
            status: 400,
            response: {
                status: 400,
                data: {
                    error: {
                        msg: 'Bad request',
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

        expect(result.current.errorMessage).toBe('Bad request')
        expect(result.current.isRetriable).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })
})
