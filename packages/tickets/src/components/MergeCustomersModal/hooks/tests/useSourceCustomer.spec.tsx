import { DurationInMs } from '@repo/utils'
import { renderHook } from '@testing-library/react'

import { mockCustomer } from '@gorgias/helpdesk-mocks'
import { useGetCustomer } from '@gorgias/helpdesk-queries'
import type * as helpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { useSourceCustomer } from '../useSourceCustomer'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useGetCustomer: vi.fn(),
    }
})

const mockedUseGetCustomer = vi.mocked(useGetCustomer)

describe('useSourceCustomer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should disable customer query when source customer is null', () => {
        mockedUseGetCustomer.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useSourceCustomer(null))

        expect(mockedUseGetCustomer).toHaveBeenCalledWith(0, undefined, {
            query: {
                enabled: false,
                staleTime: DurationInMs.FiveMinutes,
            },
        })

        expect(result.current.sourceCustomer).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it('should return source customer fallback when full data is not loaded', () => {
        const sourceCustomer = mockCustomer({
            id: 2,
            name: 'Source Customer',
            email: 'source@example.com',
        })

        mockedUseGetCustomer.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        const { result } = renderHook(() => useSourceCustomer(sourceCustomer))

        expect(mockedUseGetCustomer).toHaveBeenCalledWith(2, undefined, {
            query: {
                enabled: true,
                staleTime: DurationInMs.FiveMinutes,
            },
        })

        expect(result.current.sourceCustomer).toEqual(sourceCustomer)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return full source customer data when query succeeds', () => {
        const sourceCustomer = mockCustomer({
            id: 2,
            name: 'Fallback Source Customer',
            email: 'fallback@example.com',
        })

        const fullSourceCustomer = mockCustomer({
            id: 2,
            name: 'Loaded Source Customer',
            email: 'loaded@example.com',
        })

        mockedUseGetCustomer.mockReturnValue({
            data: {
                data: fullSourceCustomer,
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useSourceCustomer(sourceCustomer))

        expect(result.current.sourceCustomer).toEqual(fullSourceCustomer)
        expect(result.current.isLoading).toBe(false)
    })
})
