import { renderHook } from '@testing-library/react'

import { useGetArticleTranslationVersion } from 'models/helpCenter/queries'
import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'

import { useKnowledgeEditorGuidanceData } from './useKnowledgeEditorGuidanceData'

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetArticleTranslationVersion: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter')
jest.mock('pages/aiAgent/hooks/useGuidanceArticle')
jest.mock('pages/aiAgent/hooks/useGuidanceArticles')

const useAiAgentHelpCenterStateMock = jest.mocked(useAiAgentHelpCenterState)
const useGuidanceArticleMock = jest.mocked(useGuidanceArticle)
const useGuidanceArticlesMock = jest.mocked(useGuidanceArticles)
const useGetArticleTranslationVersionMock = jest.mocked(
    useGetArticleTranslationVersion,
)

const mockHelpCenter = {
    id: 10,
    name: 'Guidance Help Center',
    default_locale: 'en-US',
    supported_locales: ['en-US'],
} as ReturnType<typeof useAiAgentHelpCenterState>['helpCenter']

const mockRawArticles = [
    {
        id: 1,
        title: 'Article One',
        draftVersionId: 100,
        publishedVersionId: 200,
        visibility: 'PUBLIC' as const,
        content: 'Content One',
        locale: 'en-US' as const,
        createdDatetime: '2024-01-01',
        lastUpdated: '2024-01-02',
        templateKey: null,
    },
    {
        id: 2,
        title: 'Article Two',
        draftVersionId: 101,
        publishedVersionId: null,
        visibility: undefined,
        content: 'Content Two',
        locale: 'en-US' as const,
        createdDatetime: '2024-01-01',
        lastUpdated: '2024-01-02',
        templateKey: null,
    },
]

const mockGuidanceArticle = {
    id: 1,
    title: 'Article One',
    content: 'Content One',
    locale: 'en-US' as const,
    visibility: 'PUBLIC' as const,
    createdDatetime: '2024-01-01',
    lastUpdated: '2024-01-02',
    templateKey: null,
    draftVersionId: 100,
    publishedVersionId: 200,
}

function setupDefaultMocks() {
    useAiAgentHelpCenterStateMock.mockReturnValue({
        helpCenter: mockHelpCenter,
        isLoading: false,
    })
    useGuidanceArticlesMock.mockReturnValue({
        guidanceArticles: mockRawArticles as any,
        isGuidanceArticleListLoading: false,
        isFetched: true,
    })
    useGuidanceArticleMock.mockReturnValue({
        guidanceArticle: mockGuidanceArticle,
        isGuidanceArticleLoading: false,
        refetch: jest.fn(),
        isError: false,
        error: null,
    } as any)
}

describe('useKnowledgeEditorGuidanceData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupDefaultMocks()
    })

    describe('help center fetching', () => {
        it('calls useAiAgentHelpCenterState with the correct shopName and helpCenterType', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(useAiAgentHelpCenterStateMock).toHaveBeenCalledWith({
                shopName: 'my-shop',
                helpCenterType: 'guidance',
                enabled: true,
            })
        })

        it('returns the help center and loading state', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceHelpCenter).toBe(mockHelpCenter)
            expect(result.current.isGuidanceHelpCenterLoading).toBe(false)
        })

        it('returns loading state when help center is loading', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceHelpCenter).toBeUndefined()
            expect(result.current.isGuidanceHelpCenterLoading).toBe(true)
        })

        it('returns undefined help center when not found', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'unknown-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceHelpCenter).toBeUndefined()
            expect(result.current.isGuidanceHelpCenterLoading).toBe(false)
        })
    })

    describe('guidance articles fetching', () => {
        it('calls useGuidanceArticles with the help center id when available', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticlesMock).toHaveBeenCalledWith(
                10,
                { enabled: true },
                { version_status: 'latest_draft' },
            )
        })

        it('disables guidance articles fetching when help center is not available', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticlesMock).toHaveBeenCalledWith(
                0,
                { enabled: false },
                { version_status: 'latest_draft' },
            )
        })

        it('maps raw articles to FilteredKnowledgeHubArticle format', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceArticles).toEqual([
                {
                    id: 1,
                    title: 'Article One',
                    draftVersionId: 100,
                    publishedVersionId: 200,
                    visibility: 'PUBLIC',
                },
                {
                    id: 2,
                    title: 'Article Two',
                    draftVersionId: 101,
                    publishedVersionId: null,
                    visibility: 'UNLISTED',
                },
            ])
        })

        it('defaults visibility to UNLISTED when raw article visibility is undefined', () => {
            useGuidanceArticlesMock.mockReturnValue({
                guidanceArticles: [
                    {
                        id: 5,
                        title: 'No Visibility',
                        draftVersionId: null,
                        publishedVersionId: null,
                        visibility: undefined,
                    },
                ] as any,
                isGuidanceArticleListLoading: false,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceArticles[0].visibility).toBe(
                'UNLISTED',
            )
        })

        it('returns empty array when no articles are fetched', () => {
            useGuidanceArticlesMock.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: false,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceArticles).toEqual([])
        })

        it('preserves article visibility when explicitly set', () => {
            useGuidanceArticlesMock.mockReturnValue({
                guidanceArticles: [
                    {
                        id: 3,
                        title: 'Public Article',
                        draftVersionId: null,
                        publishedVersionId: null,
                        visibility: 'PUBLIC',
                    },
                ] as any,
                isGuidanceArticleListLoading: false,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceArticles[0].visibility).toBe('PUBLIC')
        })
    })

    describe('individual guidance article fetching', () => {
        it('calls useGuidanceArticle with correct parameters in edit mode', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith({
                guidanceHelpCenterId: 10,
                guidanceArticleId: 42,
                locale: 'en-US',
                versionStatus: 'latest_draft',
                enabled: true,
            })
        })

        it('calls useGuidanceArticle with correct parameters in read mode', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'read',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith({
                guidanceHelpCenterId: 10,
                guidanceArticleId: 42,
                locale: 'en-US',
                versionStatus: 'latest_draft',
                enabled: true,
            })
        })

        it('disables article fetching in create mode', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'create',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables article fetching when no guidanceArticleId is provided', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    guidanceArticleId: 0,
                    enabled: false,
                }),
            )
        })

        it('disables article fetching when help center is not available', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    guidanceHelpCenterId: 0,
                    locale: 'en-US',
                    enabled: false,
                }),
            )
        })

        it('returns the guidance article and loading state', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceArticle).toBe(mockGuidanceArticle)
            expect(result.current.isGuidanceArticleLoading).toBe(false)
        })

        it('returns loading state when article is loading', () => {
            useGuidanceArticleMock.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: true,
                refetch: jest.fn(),
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.guidanceArticle).toBeUndefined()
            expect(result.current.isGuidanceArticleLoading).toBe(true)
        })
    })

    describe('error handling', () => {
        it('returns error state when article fetch fails', () => {
            const mockError = new Error('Fetch failed')
            useGuidanceArticleMock.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
                isError: true,
                error: mockError,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBe(mockError)
        })

        it('returns no error state on successful fetch', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.isError).toBe(false)
            expect(result.current.error).toBeNull()
        })
    })

    describe('locale handling', () => {
        it('uses the help center default_locale for article fetching', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: {
                    ...mockHelpCenter,
                    default_locale: 'fr-FR',
                } as any,
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    locale: 'fr-FR',
                }),
            )
        })

        it('falls back to en-US when help center has no default_locale', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    locale: 'en-US',
                }),
            )
        })
    })

    describe('enabled logic combinations', () => {
        it('enables article fetch when all conditions are met (articleId + helpCenter + non-create mode)', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'read',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })

        it('disables article fetch when guidanceArticleId is 0', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 0,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('enables article fetch in diff mode', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'diff',
                }),
            )

            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })

        it('disables both articles list and article fetch when help center id is not available', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGuidanceArticlesMock).toHaveBeenCalledWith(
                0,
                { enabled: false },
                { version_status: 'latest_draft' },
            )
            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    guidanceHelpCenterId: 0,
                    enabled: false,
                }),
            )
        })

        it('disables all queries when editor is closed', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 42,
                    guidanceMode: 'edit',
                    isOpen: false,
                }),
            )

            expect(useAiAgentHelpCenterStateMock).toHaveBeenCalledWith({
                shopName: 'my-shop',
                helpCenterType: 'guidance',
                enabled: false,
            })
            expect(useGuidanceArticlesMock).toHaveBeenCalledWith(
                10,
                { enabled: false },
                { version_status: 'latest_draft' },
            )
            expect(useGuidanceArticleMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })
    })

    describe('return value structure', () => {
        it('returns all expected fields', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current).toEqual({
                guidanceHelpCenter: mockHelpCenter,
                isGuidanceHelpCenterLoading: false,
                guidanceArticles: expect.any(Array),
                guidanceArticle: mockGuidanceArticle,
                isGuidanceArticleLoading: false,
                isError: false,
                error: null,
                initialVersionData: undefined,
                isInitialVersionLoading: false,
                isInitialVersionError: undefined,
            })
        })
    })

    describe('initial version fetching', () => {
        it('calls useGetArticleTranslationVersion with correct params when initialVersionId is provided', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 42,
                }),
            )

            expect(useGetArticleTranslationVersionMock).toHaveBeenCalledWith(
                {
                    help_center_id: 10,
                    article_id: 1,
                    locale: 'en-US',
                    version_id: 42,
                },
                expect.objectContaining({
                    enabled: true,
                    staleTime: 10 * 60 * 1000,
                    refetchOnWindowFocus: false,
                }),
            )
        })

        it('disables version fetch when initialVersionId is not provided', () => {
            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(useGetArticleTranslationVersionMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    version_id: 0,
                }),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables version fetch when help center is not available', () => {
            useAiAgentHelpCenterStateMock.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 42,
                }),
            )

            expect(useGetArticleTranslationVersionMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    help_center_id: 0,
                }),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables version fetch when guidance article is not loaded', () => {
            useGuidanceArticleMock.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: true,
                refetch: jest.fn(),
                isError: false,
                error: null,
            } as any)

            renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 42,
                }),
            )

            expect(useGetArticleTranslationVersionMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    article_id: 0,
                }),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('returns initialVersionData when version is fetched and differs from current', () => {
            const mockVersionData = {
                id: 42,
                version: 3,
                title: 'Historical Title',
                content: 'Historical Content',
                published_datetime: '2024-01-15T00:00:00Z',
            }

            useGetArticleTranslationVersionMock.mockReturnValue({
                data: mockVersionData,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 42,
                }),
            )

            expect(result.current.initialVersionData).toBe(mockVersionData)
            expect(result.current.isInitialVersionLoading).toBe(false)
        })

        it('returns undefined initialVersionData when version matches publishedVersionId', () => {
            const mockVersionData = {
                id: 200,
                version: 5,
                title: 'Current Title',
                content: 'Current Content',
                published_datetime: '2024-06-01T00:00:00Z',
            }

            useGetArticleTranslationVersionMock.mockReturnValue({
                data: mockVersionData,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 200,
                }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
        })

        it('returns undefined initialVersionData when version matches draftVersionId', () => {
            const mockVersionData = {
                id: 100,
                version: 4,
                title: 'Draft Title',
                content: 'Draft Content',
                published_datetime: '2024-05-01T00:00:00Z',
            }

            useGetArticleTranslationVersionMock.mockReturnValue({
                data: mockVersionData,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 100,
                }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
        })

        it('returns isInitialVersionLoading true when version is loading and initialVersionId is set', () => {
            useGetArticleTranslationVersionMock.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 42,
                }),
            )

            expect(result.current.isInitialVersionLoading).toBe(true)
        })

        it('returns isInitialVersionError when version fetch fails', () => {
            useGetArticleTranslationVersionMock.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                    initialVersionId: 42,
                }),
            )

            expect(result.current.isInitialVersionError).toBe(true)
        })

        it('returns isInitialVersionLoading false when query is loading but no initialVersionId', () => {
            useGetArticleTranslationVersionMock.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorGuidanceData({
                    shopName: 'my-shop',
                    guidanceArticleId: 1,
                    guidanceMode: 'edit',
                }),
            )

            expect(result.current.isInitialVersionLoading).toBe(false)
        })
    })
})
