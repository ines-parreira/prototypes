import { renderHook } from '@repo/testing'

import { useFetchPublicResourcesData } from '../useFetchPublicResourcesData'

// Mock dependencies
jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterList: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/usePublicResourcesList', () => ({
    usePublicResourcesList: jest.fn(),
}))

const mockUsePublicResourcesList =
    require('pages/aiAgent/hooks/usePublicResourcesList')
        .usePublicResourcesList as jest.Mock

describe('useFetchPublicResourcesData', () => {
    const storeName = 'test-store'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns loading state initially', () => {
        mockUsePublicResourcesList.mockReturnValue({
            sourceItems: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useFetchPublicResourcesData({ storeName }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual(undefined)
    })

    it('returns call hook with store name', () => {
        mockUsePublicResourcesList.mockReturnValue({
            sourceItems: {},
            isLoading: true,
        })

        renderHook(() => useFetchPublicResourcesData({ storeName }))

        expect(mockUsePublicResourcesList).toHaveBeenCalledWith({
            shopNames: [storeName],
        })
    })

    it.each([{}, undefined, { 'another-store': [{ id: 2 }] }])(
        'returns undefined when source items = %s',
        (sourceItems) => {
            mockUsePublicResourcesList.mockReturnValue({
                isLoading: false,
                sourceItems,
            })

            const { result } = renderHook(() =>
                useFetchPublicResourcesData({ storeName }),
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBeUndefined()
        },
    )

    it('returns resources specific to store when query succeeds', () => {
        const sourceItem = { id: 1 }
        mockUsePublicResourcesList.mockReturnValue({
            isLoading: false,
            sourceItems: {
                [storeName]: [sourceItem],
                'another-store': [{ id: 2 }],
            },
        })

        const { result } = renderHook(() =>
            useFetchPublicResourcesData({ storeName }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([sourceItem])
    })
})
