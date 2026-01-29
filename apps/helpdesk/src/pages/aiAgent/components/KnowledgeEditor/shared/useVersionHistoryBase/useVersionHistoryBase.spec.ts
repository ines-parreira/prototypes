import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { act, renderHook } from '@repo/testing'

import { useInfiniteGetArticleTranslationVersions } from 'models/helpCenter/queries'

import { useVersionHistoryBase } from './useVersionHistoryBase'
import type {
    ArticleTranslationVersion,
    VersionHistoryBaseParams,
} from './useVersionHistoryBase'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    FeatureFlagKey: {
        AddVersionHistoryForArticlesAndGuidances:
            'add-version-history-for-articles-and-guidances',
    },
    useFlag: jest.fn(),
}))

jest.mock('models/helpCenter/queries', () => ({
    useInfiniteGetArticleTranslationVersions: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseInfiniteGetVersions =
    useInfiniteGetArticleTranslationVersions as jest.Mock

const mockDispatch = jest.fn()
const mockFetchNextPage = jest.fn()

const mockVersions: ArticleTranslationVersion[] = [
    {
        id: 5,
        version: 3,
        title: 'v3',
        excerpt: '',
        content: '',
        slug: '',
        seo_meta: null,
        created_datetime: '2025-03-01T00:00:00Z',
        published_datetime: '2025-03-01T00:00:00Z',
        commit_message: 'Third publish',
    },
    {
        id: 4,
        version: 2,
        title: 'v2',
        excerpt: '',
        content: '',
        slug: '',
        seo_meta: null,
        created_datetime: '2025-02-01T00:00:00Z',
        published_datetime: '2025-02-01T00:00:00Z',
        commit_message: 'Second publish',
    },
]

const defaultParams: VersionHistoryBaseParams = {
    helpCenterId: 10,
    articleId: 123,
    locale: 'en-US',
    currentVersionId: 5,
    historicalVersion: null,
    isUpdating: false,
    isAutoSaving: false,
    dispatch: mockDispatch,
}

describe('useVersionHistoryBase', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(true)

        mockUseInfiniteGetVersions.mockReturnValue({
            data: {
                pages: [
                    {
                        data: mockVersions,
                        meta: {
                            nb_pages: 1,
                            page: 1,
                            per_page: 20,
                            item_count: 2,
                            current_page: '/versions?page=1',
                        },
                    },
                ],
            },
            isLoading: false,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: mockFetchNextPage,
        })
    })

    describe('feature flag disabled', () => {
        it('should return empty versions when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            mockUseInfiniteGetVersions.mockReturnValue({
                data: undefined,
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
            expect(result.current.versions).toEqual([])
        })
    })

    describe('query disabled conditions', () => {
        it('should return empty versions when helpCenterId is 0', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: undefined,
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    helpCenterId: 0,
                }),
            )

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
            expect(result.current.versions).toEqual([])
        })

        it('should return empty versions when articleId is 0', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: undefined,
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    articleId: 0,
                }),
            )

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
            expect(result.current.versions).toEqual([])
        })
    })

    describe('returned values', () => {
        it('should return versions when enabled and data is available', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            expect(result.current.versions).toEqual(mockVersions)
        })

        it('should flatten paginated data correctly', () => {
            const page1Versions = [mockVersions[0]]
            const page2Versions = [mockVersions[1]]

            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: page1Versions }, { data: page2Versions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            expect(result.current.versions).toEqual([
                ...page1Versions,
                ...page2Versions,
            ])
        })

        it('should return correct isViewingHistoricalVersion based on historicalVersion param', () => {
            const { result: noHistorical } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )
            expect(noHistorical.current.isViewingHistoricalVersion).toBe(false)

            const { result: withHistorical } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    historicalVersion: { versionId: 4 },
                }),
            )
            expect(withHistorical.current.isViewingHistoricalVersion).toBe(true)
        })

        it('should return correct selectedVersionId from historicalVersion', () => {
            const { result: noHistorical } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )
            expect(noHistorical.current.selectedVersionId).toBeNull()

            const { result: withHistorical } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    historicalVersion: { versionId: 4 },
                }),
            )
            expect(withHistorical.current.selectedVersionId).toBe(4)
        })
    })

    describe('isDisabled', () => {
        it('should return correct isDisabled when isUpdating is true', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    isUpdating: true,
                }),
            )

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return correct isDisabled when isAutoSaving is true', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    isAutoSaving: true,
                }),
            )

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return false when not updating and not auto-saving', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            expect(result.current.isDisabled).toBe(false)
        })
    })

    describe('onSelectVersion', () => {
        it('should dispatch VIEW_HISTORICAL_VERSION when selecting a non-current version', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            result.current.onSelectVersion(mockVersions[1])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'VIEW_HISTORICAL_VERSION',
                payload: mockVersions[1],
            })
        })

        it('should dispatch CLEAR_HISTORICAL_VERSION when selecting the current version', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            result.current.onSelectVersion(mockVersions[0])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
        })

        it('should not dispatch when disabled', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    isUpdating: true,
                }),
            )

            result.current.onSelectVersion(mockVersions[1])

            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('onGoToLatest', () => {
        it('should dispatch CLEAR_HISTORICAL_VERSION', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            result.current.onGoToLatest()

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
        })

        it('should not dispatch when disabled', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    isUpdating: true,
                }),
            )

            result.current.onGoToLatest()

            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('onLoadMore', () => {
        it('should call fetchNextPage when hasNextPage and not isFetchingNextPage', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: true,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            act(() => {
                result.current.onLoadMore()
            })

            expect(mockFetchNextPage).toHaveBeenCalled()
        })

        it('should not call fetchNextPage when no next page', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            act(() => {
                result.current.onLoadMore()
            })

            expect(mockFetchNextPage).not.toHaveBeenCalled()
        })

        it('should not call fetchNextPage when already fetching', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: true,
                hasNextPage: true,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            act(() => {
                result.current.onLoadMore()
            })

            expect(mockFetchNextPage).not.toHaveBeenCalled()
        })
    })

    describe('query parameters', () => {
        it('should call useFlag with the correct feature flag key', () => {
            renderHook(() => useVersionHistoryBase(defaultParams))

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.AddVersionHistoryForArticlesAndGuidances,
            )
        })

        it('should pass correct params to the query', () => {
            renderHook(() => useVersionHistoryBase(defaultParams))

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                { help_center_id: 10, article_id: 123, locale: 'en-US' },
                { published: true, per_page: 20 },
                { enabled: true },
            )
        })

        it('should return shouldLoadMore true when hasNextPage and not fetching', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: true,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            expect(result.current.shouldLoadMore).toBe(true)
        })

        it('should return shouldLoadMore false when no next page', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            expect(result.current.shouldLoadMore).toBe(false)
        })
    })
})
