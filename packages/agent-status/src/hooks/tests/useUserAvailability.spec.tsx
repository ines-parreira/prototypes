import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { renderHook } from '../../tests/render.utils'
import { useUserAvailability } from '../useUserAvailability'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useGetUserAvailability: vi.fn(),
    }
})

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useUserAvailability', () => {
    const userId = 123

    describe('availability mapping', () => {
        it('should return availability when user is available', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'available',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.availability).toEqual({
                user_status: 'available',
            })
            expect(result.current.activeStatusId).toBe('available')
        })

        it('should return availability when user is unavailable', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'unavailable',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.availability).toEqual({
                user_status: 'unavailable',
            })
            expect(result.current.activeStatusId).toBe('unavailable')
        })

        it('should return availability and activeStatusId when user has custom status', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'custom',
                        custom_user_availability_status_id: 'custom-123',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.availability).toEqual({
                user_status: 'custom',
                custom_user_availability_status_id: 'custom-123',
            })
            expect(result.current.activeStatusId).toBe('custom-123')
        })

        it('should return undefined activeStatusId when availability is custom but no id is present', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'custom',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.availability).toEqual({
                user_status: 'custom',
            })
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })

    describe('loading state', () => {
        it('should return isLoading: true when data is loading', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.isLoading).toBe(true)
            expect(result.current.availability).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })

    describe('error state', () => {
        it('should return isError: true when API call fails', () => {
            const mockError = new Error('API error')
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: mockError,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBe(mockError)
            expect(result.current.availability).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })

    describe('undefined state', () => {
        it('should return undefined availability and activeStatusId when no data', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.availability).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })

        it('should return undefined availability when data.data is undefined', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: undefined,
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            expect(result.current.availability).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })
})
