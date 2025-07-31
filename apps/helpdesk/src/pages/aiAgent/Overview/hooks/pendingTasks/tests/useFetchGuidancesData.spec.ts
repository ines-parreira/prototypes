import { renderHook } from '@repo/testing'

import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

import { useFetchGuidancesData } from '../useFetchGuidancesData'

// Mock dependencies
jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterList: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))

const mockUseGetHelpCenterList = require('models/helpCenter/queries')
    .useGetHelpCenterList as jest.Mock
const mockUseGuidanceArticles =
    require('pages/aiAgent/hooks/useGuidanceArticles')
        .useGuidanceArticles as jest.Mock

describe('useFetchGuidancesData', () => {
    const storeName = 'test-store'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns loading state initially', () => {
        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: true,
            data: undefined,
        })
        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const { result } = renderHook(() =>
            useFetchGuidancesData({ storeName, enabled: true }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual([])
    })

    it.each([true, false])(
        'sets correct retries value when retries is set to %s',
        (retries) => {
            mockUseGetHelpCenterList.mockReturnValue({
                isLoading: true,
                data: undefined,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: false,
            })

            renderHook(() =>
                useFetchGuidancesData({
                    storeName,
                    enabled: true,
                    retries: retries,
                }),
            )

            expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
                {
                    type: 'guidance',
                    per_page: HELP_CENTER_MAX_CREATION,
                    shop_name: storeName,
                },
                expect.objectContaining({
                    ...(!retries && { retry: 0 }),
                }),
            )
            expect(mockUseGuidanceArticles).toHaveBeenCalledWith(undefined, {
                enabled: false,
                refetchOnWindowFocus: true,
                ...(!retries && { retry: 0 }),
            })
        },
    )

    it('returns articles when both queries succeed', () => {
        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    data: [{ id: 42 }],
                },
            },
        })
        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [{ id: 1, title: 'Article 1' }],
            isGuidanceArticleListLoading: false,
        })

        const { result } = renderHook(() =>
            useFetchGuidancesData({ storeName, enabled: true }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([{ id: 1, title: 'Article 1' }])
    })

    it('returns loading if guidance articles are still loading', () => {
        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    data: [{ id: 42 }],
                },
            },
        })
        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: true,
        })

        const { result } = renderHook(() =>
            useFetchGuidancesData({ storeName, enabled: true }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual([])
    })

    it('does not fetch if disabled', () => {
        const disabled = false

        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: false,
            data: undefined,
        })
        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const { result } = renderHook(() =>
            useFetchGuidancesData({ storeName, enabled: disabled }),
        )

        expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
            {
                type: 'guidance',
                per_page: HELP_CENTER_MAX_CREATION,
                shop_name: storeName,
            },
            expect.objectContaining({
                enabled: disabled,
            }),
        )
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([])
    })

    it('passes refetchOnWindowFocus = false to useGuidanceArticles', () => {
        mockUseGetHelpCenterList.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    data: [{ id: 99 }],
                },
            },
        })

        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        renderHook(() =>
            useFetchGuidancesData({
                storeName,
                enabled: true,
                refetchOnWindowFocus: false,
            }),
        )

        expect(mockUseGuidanceArticles).toHaveBeenCalledWith(99, {
            enabled: true,
            refetchOnWindowFocus: false,
        })
    })
})
