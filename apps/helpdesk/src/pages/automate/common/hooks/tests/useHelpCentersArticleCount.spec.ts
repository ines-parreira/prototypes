import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useHelpCentersArticleCount } from '../useHelpCentersArticleCount'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const useHelpCenterApiMock = useHelpCenterApi as jest.Mock

describe('useHelpCentersArticleCount', () => {
    const mockClient = { listArticles: jest.fn() }

    const getPromises = () => {
        const promises: Array<{
            resolve: (value: any) => void
            reject: () => void
        }> = []
        mockClient.listArticles.mockImplementation(
            () =>
                new Promise((resolve, reject) =>
                    promises.push({ resolve, reject }),
                ),
        )

        return {
            resolve: (i: number, item_count: number) =>
                promises[i].resolve({
                    data: {
                        meta: {
                            item_count,
                        },
                    },
                }),

            reject: (i: number) => promises[i].reject(),
        }
    }

    it('should return undefined when helpCenterIds is not provided', () => {
        useHelpCenterApiMock.mockReturnValue({ client: mockClient })
        const { result } = renderHook(() => useHelpCentersArticleCount())
        expect(result.current).toBeUndefined()
    })

    it('should return undefined when client is not available', () => {
        useHelpCenterApiMock.mockReturnValue({ client: null })
        const { result } = renderHook(() =>
            useHelpCentersArticleCount([1, 2, 3]),
        )
        expect(result.current).toBeUndefined()
    })

    it('should fetch article counts for the provided helpCenterIds', async () => {
        useHelpCenterApiMock.mockReturnValue({ client: mockClient })

        const promises = getPromises()
        const { result } = renderHook(() =>
            useHelpCentersArticleCount([1, 2, 3]),
        )

        // Initially, the result should be undefined
        expect(result.current).toBeUndefined()

        // Resolve the promises
        promises.resolve(0, 10)
        promises.resolve(1, 20)
        promises.resolve(2, 30)

        await waitFor(() => {
            expect(result.current).toEqual([
                { helpCenterId: 1, count: 10 },
                { helpCenterId: 2, count: 20 },
                { helpCenterId: 3, count: 30 },
            ])
        })
    })

    it('should handle the situation properly when one of the fetches fails', async () => {
        useHelpCenterApiMock.mockReturnValue({ client: mockClient })

        const promises = getPromises()
        const { result } = renderHook(() =>
            useHelpCentersArticleCount([1, 2, 3]),
        )

        // Initially, the result should be undefined
        expect(result.current).toBeUndefined()

        // Resolve two promises, reject one
        promises.resolve(0, 10)
        promises.reject(1)
        promises.resolve(2, 30)

        await waitFor(() => {
            expect(result.current).toEqual([
                { helpCenterId: 1, count: 10 },
                { helpCenterId: 2 },
                { helpCenterId: 3, count: 30 },
            ])
        })
    })

    it('should handle the situation properly when helpCenterIds change and a race condition occurs', async () => {
        useHelpCenterApiMock.mockReturnValue({ client: mockClient })

        const promises = getPromises()
        const { result, rerender } = renderHook(
            (helpCenterIds: number[] = [1, 2, 3]) =>
                useHelpCentersArticleCount(helpCenterIds),
        )

        // Initially, the result should be undefined
        expect(result.current).toBeUndefined()

        // Render hook with new values before promises are resolved
        rerender([4, 5, 6])

        // Resolve promises for the second render
        promises.resolve(0, 10)
        promises.resolve(2, 30)
        promises.resolve(3, 40)
        promises.resolve(4, 50)
        promises.resolve(5, 60)

        // 🛡 Wait until result reflects the rerender values
        await waitFor(() => {
            expect(result.current).toEqual([
                { helpCenterId: 4, count: 40 },
                { helpCenterId: 5, count: 50 },
                { helpCenterId: 6, count: 60 },
            ])
        })

        // Resolve the last old promise from the first render
        promises.resolve(1, 20)

        // save current value
        const lastResult = result.current

        // Use waitFor to confirm state is stable
        await waitFor(
            () => {
                expect(result.current).toEqual(lastResult)
            },
            { timeout: 50 },
        )
    })
})
