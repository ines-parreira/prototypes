import { logEvent, SegmentEvent } from '@repo/logging'
import { act, renderHook } from '@repo/testing'

import {
    useGetArticleTranslationVersion,
    useInfiniteGetArticleTranslationVersions,
} from 'models/helpCenter/queries'

import {
    getVersionImpactDateRange,
    useVersionHistoryBase,
} from './useVersionHistoryBase'
import type {
    ArticleTranslationVersion,
    VersionHistoryBaseParams,
} from './useVersionHistoryBase'

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationVersion: jest.fn(),
    useInfiniteGetArticleTranslationVersions: jest.fn(),
}))

jest.mock('@repo/logging')

const mockUseGetVersion = useGetArticleTranslationVersion as jest.Mock
const mockUseInfiniteGetVersions =
    useInfiniteGetArticleTranslationVersions as jest.Mock
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const mockDispatch = jest.fn()
const mockFetchNextPage = jest.fn()
const mockSwitchToVersion = jest.fn()

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
    shopName: 'test-shop',
    resourceType: 'guidance',
    helpCenterId: 10,
    articleId: 123,
    locale: 'en-US',
    currentVersionId: 5,
    draftVersionId: null,
    historicalVersion: null,
    isUpdating: false,
    isAutoSaving: false,
    dispatch: mockDispatch,
}

describe('useVersionHistoryBase', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetVersion.mockReturnValue({
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
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        publishedDatetime: '2025-02-01T00:00:00Z',
                    },
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
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        publishedDatetime: '2025-02-01T00:00:00Z',
                    },
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
        it('should dispatch VIEW_HISTORICAL_VERSION with impactDateRange when selecting a non-current version', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

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

        it('should track version viewed event when selecting a non-current version', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            result.current.onSelectVersion(mockVersions[1])

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: 123,
                    helpCenterId: 10,
                    locale: 'en-US',
                    versionId: 4,
                    versionNumber: 2,
                    publishedDatetime: '2025-02-01T00:00:00Z',
                },
            )
        })

        it('should track version viewed event when selecting the current version', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            result.current.onSelectVersion(mockVersions[0])

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: 123,
                    helpCenterId: 10,
                    locale: 'en-US',
                    versionId: 5,
                    versionNumber: 3,
                    publishedDatetime: '2025-03-01T00:00:00Z',
                },
            )
        })

        it('should not track when disabled', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    isUpdating: true,
                }),
            )

            result.current.onSelectVersion(mockVersions[1])

            expect(mockLogEvent).not.toHaveBeenCalled()
        })

        it('should track with article resourceType when configured', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    resourceType: 'article',
                }),
            )

            result.current.onSelectVersion(mockVersions[1])

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                expect.objectContaining({ resourceType: 'article' }),
            )
        })
    })

    describe('onGoToLatest', () => {
        beforeEach(() => {
            mockSwitchToVersion.mockResolvedValue(undefined)
        })

        it('should call switchToVersion with latest_draft when provided', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    switchToVersion: mockSwitchToVersion,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('latest_draft')
        })

        it('should dispatch CLEAR_HISTORICAL_VERSION after switchToVersion resolves', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    switchToVersion: mockSwitchToVersion,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'CLEAR_HISTORICAL_VERSION',
            })
        })

        it('should not dispatch when switchToVersion is not provided', () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase(defaultParams),
            )

            result.current.onGoToLatest()

            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should not call switchToVersion when disabled', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    switchToVersion: mockSwitchToVersion,
                    isUpdating: true,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockSwitchToVersion).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should not dispatch when disabled via isAutoSaving', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    switchToVersion: mockSwitchToVersion,
                    isAutoSaving: true,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockSwitchToVersion).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should track back to current event when viewing a historical version', async () => {
            const historicalVersion = {
                versionId: 4,
                version: 2,
                publishedDatetime: '2025-02-01T00:00:00Z',
            }

            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    historicalVersion,
                    switchToVersion: mockSwitchToVersion,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryBackToCurrent,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: 123,
                    helpCenterId: 10,
                    locale: 'en-US',
                    versionId: 4,
                    versionNumber: 2,
                    publishedDatetime: '2025-02-01T00:00:00Z',
                },
            )
        })

        it('should not track back to current event when no historical version is set', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    switchToVersion: mockSwitchToVersion,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryBackToCurrent,
                expect.anything(),
            )
        })

        it('should not track when disabled', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        publishedDatetime: '2025-02-01T00:00:00Z',
                    },
                    switchToVersion: mockSwitchToVersion,
                    isUpdating: true,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockLogEvent).not.toHaveBeenCalled()
        })

        it('should handle historical version with null publishedDatetime', async () => {
            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        publishedDatetime: null,
                    },
                    switchToVersion: mockSwitchToVersion,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryBackToCurrent,
                expect.objectContaining({ publishedDatetime: null }),
            )
        })

        it('should track back to current before calling switchToVersion', async () => {
            const callOrder: string[] = []
            mockLogEvent.mockImplementation(() => {
                callOrder.push('logEvent')
            })
            mockSwitchToVersion.mockImplementation(() => {
                callOrder.push('switchToVersion')
                return Promise.resolve()
            })

            const { result } = renderHook(() =>
                useVersionHistoryBase({
                    ...defaultParams,
                    historicalVersion: {
                        versionId: 4,
                        version: 2,
                        publishedDatetime: '2025-02-01T00:00:00Z',
                    },
                    switchToVersion: mockSwitchToVersion,
                }),
            )

            await act(async () => {
                result.current.onGoToLatest()
            })

            expect(callOrder).toEqual(['logEvent', 'switchToVersion'])
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

describe('getVersionImpactDateRange', () => {
    const createVersion = (
        id: number,
        publishedDatetime: string | null,
    ): ArticleTranslationVersion => ({
        id,
        version: id,
        title: `v${id}`,
        excerpt: '',
        content: '',
        slug: '',
        seo_meta: null,
        created_datetime: publishedDatetime ?? '2025-01-01T00:00:00Z',
        published_datetime: publishedDatetime,
        commit_message: `Publish ${id}`,
    })

    const versionsFixture: ArticleTranslationVersion[] = [
        createVersion(3, '2025-03-15T10:00:00Z'),
        createVersion(2, '2025-02-10T10:00:00Z'),
        createVersion(1, '2025-01-05T10:00:00Z'),
    ]

    describe('basic date range calculation', () => {
        it('should return date range from version publish to next version publish for historical version', () => {
            const result = getVersionImpactDateRange(2, versionsFixture)

            expect(result).toEqual({
                start_datetime: '2025-02-10T10:00:00Z',
                end_datetime: '2025-03-15T10:00:00.000Z',
            })
        })

        it('should return date range from version publish to next version publish for oldest version', () => {
            const result = getVersionImpactDateRange(1, versionsFixture)

            expect(result).toEqual({
                start_datetime: '2025-01-05T10:00:00Z',
                end_datetime: '2025-02-10T10:00:00.000Z',
            })
        })

        it('should return date range ending at current time for latest version', () => {
            const result = getVersionImpactDateRange(3, versionsFixture)

            expect(result.start_datetime).toBe('2025-03-15T10:00:00Z')
            expect(new Date(result.end_datetime).getTime()).toBeGreaterThan(
                Date.now() - 1000 * 60 * 60,
            )
        })
    })

    describe('fallback to default date range', () => {
        it('should return default 28-day date range when version not found', () => {
            const result = getVersionImpactDateRange(999, versionsFixture)

            expect(result.start_datetime).toBeDefined()
            expect(result.end_datetime).toBeDefined()
            const diffMs =
                new Date(result.end_datetime).getTime() -
                new Date(result.start_datetime).getTime()
            const diffDays = diffMs / (1000 * 60 * 60 * 24)
            expect(diffDays).toBeCloseTo(28, 0)
        })

        it('should return default date range when version has no published_datetime', () => {
            const versionsWithNullDate: ArticleTranslationVersion[] = [
                createVersion(3, null),
            ]

            const result = getVersionImpactDateRange(3, versionsWithNullDate)

            expect(result.start_datetime).toBeDefined()
            expect(result.end_datetime).toBeDefined()
            const diffMs =
                new Date(result.end_datetime).getTime() -
                new Date(result.start_datetime).getTime()
            const diffDays = diffMs / (1000 * 60 * 60 * 24)
            expect(diffDays).toBeCloseTo(28, 0)
        })

        it('should return default date range when versions array is empty', () => {
            const result = getVersionImpactDateRange(1, [])

            expect(result.start_datetime).toBeDefined()
            expect(result.end_datetime).toBeDefined()
            const diffMs =
                new Date(result.end_datetime).getTime() -
                new Date(result.start_datetime).getTime()
            const diffDays = diffMs / (1000 * 60 * 60 * 24)
            expect(diffDays).toBeCloseTo(28, 0)
        })
    })

    describe('no date range cap', () => {
        it('should use full range when next version is more than 365 days later', () => {
            const twoYearsLater = '2027-01-05T10:00:00Z'
            const versionsWithLongGap: ArticleTranslationVersion[] = [
                createVersion(2, twoYearsLater),
                createVersion(1, '2025-01-05T10:00:00Z'),
            ]

            const result = getVersionImpactDateRange(1, versionsWithLongGap)

            expect(result).toEqual({
                start_datetime: '2025-01-05T10:00:00Z',
                end_datetime: '2027-01-05T10:00:00.000Z',
            })
        })

        it('should use full range for latest version published more than 365 days ago', () => {
            jest.useFakeTimers()
            const oldDate = '2020-01-01T10:00:00Z'
            const now = new Date('2025-01-01T12:00:00Z')
            jest.setSystemTime(now)

            const oldVersions: ArticleTranslationVersion[] = [
                createVersion(1, oldDate),
            ]

            const result = getVersionImpactDateRange(1, oldVersions)

            expect(result.start_datetime).toBe(oldDate)

            const expectedEnd = new Date(now)
            expectedEnd.setHours(expectedEnd.getHours() + 1, 0, 0, 0)
            expect(result.end_datetime).toBe(expectedEnd.toISOString())

            jest.useRealTimers()
        })
    })

    describe('edge cases', () => {
        it('should handle single version in array (latest version)', () => {
            const singleVersion: ArticleTranslationVersion[] = [
                createVersion(1, '2025-03-15T10:00:00Z'),
            ]

            const result = getVersionImpactDateRange(1, singleVersion)

            expect(result.start_datetime).toBe('2025-03-15T10:00:00Z')
            expect(new Date(result.end_datetime).getTime()).toBeGreaterThan(
                Date.now() - 1000 * 60 * 60,
            )
        })

        it('should handle version at index 0 (newest) with no next version', () => {
            const result = getVersionImpactDateRange(3, versionsFixture)

            expect(result.start_datetime).toBe('2025-03-15T10:00:00Z')
            expect(
                new Date(result.end_datetime).getTime(),
            ).toBeGreaterThanOrEqual(Date.now())
        })

        it('should handle version at last index (oldest) correctly', () => {
            const result = getVersionImpactDateRange(1, versionsFixture)

            expect(result).toEqual({
                start_datetime: '2025-01-05T10:00:00Z',
                end_datetime: '2025-02-10T10:00:00.000Z',
            })
        })

        it('should use next version publish date as end date when available', () => {
            const middleResult = getVersionImpactDateRange(2, versionsFixture)

            expect(middleResult.end_datetime).toBe('2025-03-15T10:00:00.000Z')
        })
    })
})
