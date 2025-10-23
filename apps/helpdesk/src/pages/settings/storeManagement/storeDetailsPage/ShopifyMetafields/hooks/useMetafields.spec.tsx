import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { data } from '../MetafieldsTable/data'
import { useMetafields } from './useMetafields'

describe('useMetafields', () => {
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
    })

    afterEach(() => {
        queryClient.clear()
    })

    it('should return metafields data', async () => {
        const { result } = renderHook(() => useMetafields(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(data)
    })

    it('should return loading state initially', () => {
        const { result } = renderHook(() => useMetafields(), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })
})
