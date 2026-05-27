import { renderHook } from '@repo/testing'

import { useGetArticleTranslationVersions } from 'models/helpCenter/queries'

import type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase/useVersionHistoryBase'
import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import { mockSkillPerformanceChartMarkers } from './SkillPerformanceTrendMockData'
import {
    deriveSkillEventMarkers,
    useSkillEventMarkers,
} from './useSkillEventMarkers'

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: jest.fn(),
}))

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationVersions: jest.fn(),
}))

const mockUseSkillEditorStore = useSkillEditorStore as unknown as jest.Mock
const mockUseGetArticleTranslationVersions =
    useGetArticleTranslationVersions as jest.Mock

const buildVersion = (
    overrides: Partial<ArticleTranslationVersion> = {},
): ArticleTranslationVersion =>
    ({
        id: 1,
        version: 1,
        content: '',
        excerpt: '',
        slug: '',
        title: '',
        seo_meta: null,
        created_datetime: '2026-04-20T10:00:00.000Z',
        published_datetime: '2026-04-20T10:00:00.000Z',
        ...overrides,
    }) as ArticleTranslationVersion

const setStoreState = (
    overrides: Partial<{
        helpCenterId: number
        helpCenterLocale: string | undefined
        shopName: string
    }> = {},
) => {
    const state = {
        config: {
            shopName: overrides.shopName ?? 'acme',
            helpCenter: {
                id: 10,
                default_locale: 'en-US',
                ...(overrides.helpCenterLocale !== undefined
                    ? { default_locale: overrides.helpCenterLocale }
                    : {}),
                ...(overrides.helpCenterId !== undefined
                    ? { id: overrides.helpCenterId }
                    : {}),
            },
        },
    }

    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector(state),
    )
}

describe('deriveSkillEventMarkers', () => {
    it('returns an empty array when no versions are supplied', () => {
        expect(deriveSkillEventMarkers(undefined)).toEqual([])
        expect(deriveSkillEventMarkers([])).toEqual([])
    })

    it('produces one marker per published version, in input order', () => {
        const versions = [
            buildVersion({
                id: 11,
                published_datetime: '2026-04-22T09:00:00.000Z',
            }),
            buildVersion({
                id: 12,
                published_datetime: '2026-04-20T09:00:00.000Z',
            }),
        ]

        const result = deriveSkillEventMarkers(versions)

        expect(result).toHaveLength(2)
        expect(result.map((m) => m.id)).toEqual([
            'skill-version-11',
            'skill-version-12',
        ])
    })

    it('slices the published datetime to YYYY-MM-DD so it matches the chart dateKey', () => {
        const [marker] = deriveSkillEventMarkers([
            buildVersion({
                id: 7,
                published_datetime: '2026-04-20T15:42:11.123Z',
            }),
        ])

        expect(marker.date).toBe('2026-04-20')
    })

    it('uses the M6 marker label for every event', () => {
        const versions = [buildVersion({ id: 1 }), buildVersion({ id: 2 })]

        deriveSkillEventMarkers(versions).forEach((marker) => {
            expect(marker.label).toBe('Changes published in skill')
        })
    })

    it('exposes commit_message as the marker description when present', () => {
        const [marker] = deriveSkillEventMarkers([
            buildVersion({ id: 1, commit_message: 'Tightened intent routing' }),
        ])

        expect(marker.description).toBe('Tightened intent routing')
    })

    it('omits the description key entirely when commit_message is missing', () => {
        const [marker] = deriveSkillEventMarkers([buildVersion({ id: 1 })])

        expect('description' in marker).toBe(false)
    })

    it('omits the description key when commit_message is an empty string', () => {
        const [marker] = deriveSkillEventMarkers([
            buildVersion({ id: 1, commit_message: '' }),
        ])

        expect('description' in marker).toBe(false)
    })

    it('skips draft versions that were never published', () => {
        const versions = [
            buildVersion({ id: 1, published_datetime: null }),
            buildVersion({
                id: 2,
                published_datetime: '2026-04-20T09:00:00.000Z',
            }),
        ]

        const result = deriveSkillEventMarkers(versions)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('skill-version-2')
    })

    it('never leaks publisher info onto the marker', () => {
        const [marker] = deriveSkillEventMarkers([
            buildVersion({
                id: 1,
                commit_message: 'msg',
                publisher_user_id: 42,
            }),
        ])

        expect(marker).not.toHaveProperty('actionLabel')
        expect(marker).not.toHaveProperty('publisher_user_id')
    })

    it('omits actionHref when no skillLink is supplied', () => {
        const [marker] = deriveSkillEventMarkers([buildVersion({ id: 1 })])

        expect('actionHref' in marker).toBe(false)
    })

    it('sets actionHref to the skill editor URL scoped to the version when skillLink is supplied', () => {
        const [marker] = deriveSkillEventMarkers(
            [buildVersion({ id: 17 })],
            undefined,
            { skillId: 42, shopName: 'acme' },
        )

        expect(marker.actionHref).toBe(
            '/app/ai-agent/shopify/acme/skills/42?versionId=17',
        )
    })

    describe('date range filtering', () => {
        const range = {
            start_datetime: '2026-04-20T00:00:00.000Z',
            end_datetime: '2026-04-25T23:59:59.999Z',
        }
        const versions = [
            buildVersion({
                id: 1,
                published_datetime: '2026-04-19T23:00:00.000Z',
            }),
            buildVersion({
                id: 2,
                published_datetime: '2026-04-20T08:00:00.000Z',
            }),
            buildVersion({
                id: 3,
                published_datetime: '2026-04-23T12:00:00.000Z',
            }),
            buildVersion({
                id: 4,
                published_datetime: '2026-04-25T22:00:00.000Z',
            }),
            buildVersion({
                id: 5,
                published_datetime: '2026-04-26T01:00:00.000Z',
            }),
        ]

        it('keeps markers whose published day falls inside the inclusive range', () => {
            const result = deriveSkillEventMarkers(versions, range)

            expect(result.map((m) => m.id)).toEqual([
                'skill-version-2',
                'skill-version-3',
                'skill-version-4',
            ])
        })

        it('drops markers published before the range start', () => {
            const result = deriveSkillEventMarkers(versions, range)

            expect(
                result.find((m) => m.id === 'skill-version-1'),
            ).toBeUndefined()
        })

        it('drops markers published after the range end', () => {
            const result = deriveSkillEventMarkers(versions, range)

            expect(
                result.find((m) => m.id === 'skill-version-5'),
            ).toBeUndefined()
        })

        it('returns every published marker when no range is supplied', () => {
            const result = deriveSkillEventMarkers(versions)

            expect(result).toHaveLength(5)
        })
    })
})

describe('useSkillEventMarkers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setStoreState()
        mockUseGetArticleTranslationVersions.mockReturnValue({
            data: { data: [], meta: {}, object: 'list' },
            isLoading: false,
        })
    })

    it('returns an empty marker list and is not loading when skillId is missing', () => {
        const { result } = renderHook(() =>
            useSkillEventMarkers(undefined, { useMockData: false }),
        )

        expect(result.current.markers).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it('disables the underlying query when skillId is missing', () => {
        renderHook(() =>
            useSkillEventMarkers(undefined, { useMockData: false }),
        )

        expect(mockUseGetArticleTranslationVersions).toHaveBeenCalledWith(
            expect.objectContaining({ article_id: 0 }),
            undefined,
            { enabled: false },
        )
    })

    it('forwards helpCenterId, skillId and locale to the versions query', () => {
        renderHook(() => useSkillEventMarkers(42, { useMockData: false }))

        expect(mockUseGetArticleTranslationVersions).toHaveBeenCalledWith(
            {
                help_center_id: 10,
                article_id: 42,
                locale: 'en-US',
            },
            undefined,
            { enabled: true },
        )
    })

    it('falls back to en-US locale when default_locale is unset', () => {
        setStoreState({ helpCenterLocale: undefined })

        renderHook(() => useSkillEventMarkers(42, { useMockData: false }))

        expect(mockUseGetArticleTranslationVersions).toHaveBeenCalledWith(
            expect.objectContaining({ locale: 'en-US' }),
            undefined,
            expect.anything(),
        )
    })

    it('derives markers from the versions response', () => {
        mockUseGetArticleTranslationVersions.mockReturnValue({
            data: {
                data: [
                    buildVersion({
                        id: 11,
                        published_datetime: '2026-04-22T09:00:00.000Z',
                        commit_message: 'Tightened routing',
                    }),
                    buildVersion({
                        id: 12,
                        published_datetime: null,
                    }),
                ],
                meta: {},
                object: 'list',
            },
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useSkillEventMarkers(42, { useMockData: false }),
        )

        expect(result.current.markers).toEqual([
            {
                id: 'skill-version-11',
                date: '2026-04-22',
                label: 'Changes published in skill',
                description: 'Tightened routing',
                actionHref: '/app/ai-agent/shopify/acme/skills/42?versionId=11',
            },
        ])
    })

    it('routes the marker actionHref through the active shop name from the store', () => {
        setStoreState({ shopName: 'best-shop' })
        mockUseGetArticleTranslationVersions.mockReturnValue({
            data: {
                data: [
                    buildVersion({
                        id: 7,
                        published_datetime: '2026-04-22T09:00:00.000Z',
                    }),
                ],
                meta: {},
                object: 'list',
            },
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useSkillEventMarkers(99, { useMockData: false }),
        )

        expect(result.current.markers[0]?.actionHref).toBe(
            '/app/ai-agent/shopify/best-shop/skills/99?versionId=7',
        )
    })

    it('reflects the underlying loading state while a real query is in flight', () => {
        mockUseGetArticleTranslationVersions.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useSkillEventMarkers(42, { useMockData: false }),
        )

        expect(result.current.markers).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })

    describe('when useMockData is true', () => {
        it('returns the mock chart markers regardless of the API response', () => {
            mockUseGetArticleTranslationVersions.mockReturnValue({
                data: {
                    data: [
                        buildVersion({
                            id: 999,
                            published_datetime: '2099-01-01T00:00:00.000Z',
                            commit_message: 'Should not appear',
                        }),
                    ],
                    meta: {},
                    object: 'list',
                },
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useSkillEventMarkers(42, { useMockData: true }),
            )

            expect(result.current.markers).toBe(
                mockSkillPerformanceChartMarkers,
            )
            expect(result.current.isLoading).toBe(false)
        })

        it('disables the underlying versions query so no network call fires', () => {
            renderHook(() => useSkillEventMarkers(42, { useMockData: true }))

            expect(mockUseGetArticleTranslationVersions).toHaveBeenCalledWith(
                expect.objectContaining({ article_id: 42 }),
                undefined,
                { enabled: false },
            )
        })

        it('filters mock markers to the supplied date range', () => {
            const { result } = renderHook(() =>
                useSkillEventMarkers(42, {
                    useMockData: true,
                    dateRange: {
                        start_datetime: '2026-05-01T00:00:00.000Z',
                        end_datetime: '2026-05-10T23:59:59.999Z',
                    },
                }),
            )

            expect(result.current.markers).toEqual(
                mockSkillPerformanceChartMarkers.filter(
                    (marker) =>
                        marker.date >= '2026-05-01' &&
                        marker.date <= '2026-05-10',
                ),
            )
        })
    })

    describe('date range filtering', () => {
        it('only emits markers whose published day is inside the range', () => {
            mockUseGetArticleTranslationVersions.mockReturnValue({
                data: {
                    data: [
                        buildVersion({
                            id: 1,
                            published_datetime: '2026-04-15T00:00:00.000Z',
                        }),
                        buildVersion({
                            id: 2,
                            published_datetime: '2026-04-22T12:00:00.000Z',
                        }),
                        buildVersion({
                            id: 3,
                            published_datetime: '2026-05-02T00:00:00.000Z',
                        }),
                    ],
                    meta: {},
                    object: 'list',
                },
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useSkillEventMarkers(42, {
                    useMockData: false,
                    dateRange: {
                        start_datetime: '2026-04-20T00:00:00.000Z',
                        end_datetime: '2026-04-28T23:59:59.999Z',
                    },
                }),
            )

            expect(result.current.markers.map((m) => m.id)).toEqual([
                'skill-version-2',
            ])
        })
    })
})
