import { act, renderHook } from '@repo/testing'

import {
    useGetArticleTranslationVersion as useGetVersion,
    useInfiniteGetArticleTranslationVersions,
} from 'models/helpCenter/queries'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { useGuidanceContext } from '../../context'
import type {
    ArticleTranslationVersion,
    GuidanceState,
} from '../../context/types'
import { useVersionHistory } from '../useVersionHistory'

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationVersion: jest.fn(),
    useInfiniteGetArticleTranslationVersions: jest.fn(),
}))

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
}))

const mockSwitchToVersion = jest.fn().mockResolvedValue(undefined)
jest.mock('../useSwitchVersion', () => ({
    useSwitchVersion: () => ({ switchToVersion: mockSwitchToVersion }),
}))

const mockUseInfiniteGetVersions =
    useInfiniteGetArticleTranslationVersions as jest.Mock
const mockUseGuidanceContext = useGuidanceContext as jest.Mock

const mockDispatch = jest.fn()

const mockGuidance: GuidanceArticle = {
    id: 123,
    title: 'Test Guidance',
    content: '<p>Test</p>',
    locale: 'en-US',
    visibility: 'PUBLIC',
    createdDatetime: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
    templateKey: null,
    isCurrent: true,
    draftVersionId: null,
    publishedVersionId: 5,
}

const defaultState: GuidanceState = {
    guidanceMode: 'read',
    isFullscreen: false,
    isDetailsView: true,
    title: 'Test Guidance',
    content: '<p>Test</p>',
    visibility: true,
    savedSnapshot: { title: 'Test Guidance', content: '<p>Test</p>' },
    guidance: mockGuidance,
    isAutoSaving: false,
    hasAutoSavedInSession: false,
    isFromTemplate: false,
    hasTemplateChanges: false,
    versionStatus: 'latest_draft',
    historicalVersion: null,
    activeModal: null,
    isUpdating: false,
}

const defaultConfig = {
    shopName: 'test-shop',
    shopType: 'shopify',
    initialMode: 'read' as const,
    guidanceHelpCenter: { id: 10, default_locale: 'en-US' },
    onClose: jest.fn(),
}

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

const mockFetchNextPage = jest.fn()

describe('useVersionHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockSwitchToVersion.mockResolvedValue(undefined)
        ;(useGetVersion as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        })

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

        mockUseGuidanceContext.mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    describe('query enablement', () => {
        it('should pass enabled: true to the query when required params are set', () => {
            renderHook(() => useVersionHistory())

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                { help_center_id: 10, article_id: 123, locale: 'en-US' },
                { published: true, per_page: 20 },
                { enabled: true },
            )
        })
    })

    describe('query parameters', () => {
        it('should pass correct path params from context', () => {
            renderHook(() => useVersionHistory())

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                { help_center_id: 10, article_id: 123, locale: 'en-US' },
                expect.objectContaining({ published: true }),
                expect.any(Object),
            )
        })

        it('should disable the query when helpCenterId is 0', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: { id: 0, default_locale: 'en-US' },
                },
            })

            renderHook(() => useVersionHistory())

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('should disable the query when articleId is 0', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            renderHook(() => useVersionHistory())

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                expect.objectContaining({ article_id: 0 }),
                expect.any(Object),
                expect.objectContaining({ enabled: false }),
            )
        })
    })

    describe('returned values', () => {
        it('should return versions from the query data', () => {
            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.versions).toEqual(mockVersions)
        })

        it('should return empty array when query has no data', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.versions).toEqual([])
        })

        it('should return isLoading from the query', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.isLoading).toBe(true)
        })

        it('should return currentVersionId from guidance publishedVersionId', () => {
            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.currentVersionId).toBe(5)
        })

        it('should return null currentVersionId when guidance is undefined', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.currentVersionId).toBeNull()
        })

        it('should return selectedVersionId from historicalVersion', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: {
                    ...defaultState,
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        title: 'v2',
                        content: '',
                        publishedDatetime: null,
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.selectedVersionId).toBe(4)
        })

        it('should return null selectedVersionId when no historical version', () => {
            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.selectedVersionId).toBeNull()
        })

        it('should return isViewingHistoricalVersion based on historicalVersion state', () => {
            const { result: noHistorical } = renderHook(() =>
                useVersionHistory(),
            )
            expect(noHistorical.current.isViewingHistoricalVersion).toBe(false)

            mockUseGuidanceContext.mockReturnValue({
                state: {
                    ...defaultState,
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        title: 'v2',
                        content: '',
                        publishedDatetime: null,
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result: withHistorical } = renderHook(() =>
                useVersionHistory(),
            )
            expect(withHistorical.current.isViewingHistoricalVersion).toBe(true)
        })
    })

    describe('isDisabled', () => {
        it('should return false when not updating and not auto-saving', () => {
            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.isDisabled).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when isAutoSaving is true', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: { ...defaultState, isAutoSaving: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.isDisabled).toBe(true)
        })
    })

    describe('onSelectVersion', () => {
        it('should dispatch VIEW_HISTORICAL_VERSION with impactDateRange for a non-current version', () => {
            const { result } = renderHook(() => useVersionHistory())

            result.current.onSelectVersion(mockVersions[1])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'VIEW_HISTORICAL_VERSION',
                payload: {
                    ...mockVersions[1],
                    impactDateRange: {
                        start_datetime: '2025-02-01T00:00:00Z',
                        end_datetime: '2025-03-01T00:00:00.000Z',
                    },
                },
            })
        })

        it('should dispatch CLEAR_HISTORICAL_VERSION when selecting the current version', () => {
            const { result } = renderHook(() => useVersionHistory())

            result.current.onSelectVersion(mockVersions[0])

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
        })

        it('should not dispatch when disabled', () => {
            mockUseGuidanceContext.mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useVersionHistory())

            result.current.onSelectVersion(mockVersions[1])

            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('onGoToLatest', () => {
        it('should call switchToVersion with latest_draft and dispatch CLEAR_HISTORICAL_VERSION after resolution', async () => {
            const { result } = renderHook(() => useVersionHistory())

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('latest_draft')
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
        })

        it('should not call switchToVersion or dispatch when disabled', async () => {
            mockUseGuidanceContext.mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useVersionHistory())

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockSwitchToVersion).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('pagination', () => {
        it('should pass per_page query param', () => {
            renderHook(() => useVersionHistory())

            expect(mockUseInfiniteGetVersions).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ per_page: 20 }),
                expect.any(Object),
            )
        })

        it('should return hasNextPage false when on the last page', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.hasNextPage).toBe(false)
        })

        it('should return hasNextPage true when there are more pages', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: true,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.hasNextPage).toBe(true)
        })

        it('should return isFetchingNextPage false on initial load', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: undefined,
                isLoading: true,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() => useVersionHistory())

            expect(result.current.isFetchingNextPage).toBe(false)
        })

        it('should call fetchNextPage when onLoadMore is called and hasNextPage is true', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: true,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() => useVersionHistory())

            act(() => {
                result.current.onLoadMore()
            })

            expect(mockFetchNextPage).toHaveBeenCalled()
        })

        it('should not call fetchNextPage when there is no next page', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() => useVersionHistory())

            act(() => {
                result.current.onLoadMore()
            })

            expect(mockFetchNextPage).not.toHaveBeenCalled()
        })

        it('should not call fetchNextPage when already fetching next page', () => {
            mockUseInfiniteGetVersions.mockReturnValue({
                data: {
                    pages: [{ data: mockVersions }],
                },
                isLoading: false,
                isFetchingNextPage: true,
                hasNextPage: true,
                fetchNextPage: mockFetchNextPage,
            })

            const { result } = renderHook(() => useVersionHistory())

            act(() => {
                result.current.onLoadMore()
            })

            expect(mockFetchNextPage).not.toHaveBeenCalled()
        })

        it('should expose onLoadMore function', () => {
            const { result } = renderHook(() => useVersionHistory())

            expect(typeof result.current.onLoadMore).toBe('function')
        })
    })
})
