import { renderHook } from '@testing-library/react'

import {
    useGetArticleTranslationVersion,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'

import { useFaqHelpCenterData } from './useFaqHelpCenterData'
import { useKnowledgeEditorArticleData } from './useKnowledgeEditorArticleData'

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetHelpCenterArticle: jest.fn(() => ({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
    })),
    useGetArticleTranslationVersion: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
}))

jest.mock('./useFaqHelpCenterData', () => ({
    useFaqHelpCenterData: jest.fn(() => ({
        helpCenter: undefined,
        categories: [],
        locales: [],
        isLoading: false,
    })),
}))

const mockUseFaqHelpCenterData = jest.mocked(useFaqHelpCenterData)
const mockUseGetHelpCenterArticle = jest.mocked(useGetHelpCenterArticle)
const mockUseGetArticleTranslationVersion = jest.mocked(
    useGetArticleTranslationVersion,
)

const mockHelpCenter = {
    id: 10,
    name: 'FAQ Help Center',
    default_locale: 'en-US',
    supported_locales: ['en-US'],
}

const mockArticle = {
    id: 1,
    translation: {
        title: 'Test Article',
        content: 'Test Content',
        locale: 'en-US',
    },
}

function setupDefaultMocks() {
    mockUseFaqHelpCenterData.mockReturnValue({
        helpCenter: mockHelpCenter as any,
        categories: [],
        locales: [{ code: 'en-US', name: 'en-US' }] as any,
        isLoading: false,
    })
    mockUseGetHelpCenterArticle.mockReturnValue({
        data: mockArticle,
        isLoading: false,
        isError: false,
        error: null,
    } as any)
    mockUseGetArticleTranslationVersion.mockReturnValue({
        data: undefined,
        isLoading: false,
    } as any)
}

describe('useKnowledgeEditorArticleData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupDefaultMocks()
    })

    describe('help center data fetching', () => {
        it('calls useFaqHelpCenterData with helpCenterId and isOpen', () => {
            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isOpen: true,
                    isExisting: true,
                }),
            )

            expect(mockUseFaqHelpCenterData).toHaveBeenCalledWith(10, true)
        })

        it('passes isOpen=false when editor is closed', () => {
            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isOpen: false,
                    isExisting: true,
                }),
            )

            expect(mockUseFaqHelpCenterData).toHaveBeenCalledWith(10, false)
        })

        it('returns help center data', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(result.current.helpCenter).toBe(mockHelpCenter)
            expect(result.current.isHelpCenterDataLoading).toBe(false)
        })

        it('returns loading when help center is loading', () => {
            mockUseFaqHelpCenterData.mockReturnValue({
                helpCenter: undefined,
                categories: [],
                locales: [],
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(result.current.isHelpCenterDataLoading).toBe(true)
        })
    })

    describe('article fetching', () => {
        it('calls useGetHelpCenterArticle with correct params', () => {
            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isOpen: true,
                    isExisting: true,
                }),
            )

            expect(mockUseGetHelpCenterArticle).toHaveBeenCalledWith(
                1,
                10,
                'en-US',
                'latest_draft',
                {
                    enabled: true,
                    throwOn404: true,
                    refetchOnWindowFocus: false,
                },
            )
        })

        it('disables article fetch for new articles', () => {
            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 0,
                    versionStatus: 'latest_draft',
                    isExisting: false,
                }),
            )

            expect(mockUseGetHelpCenterArticle).toHaveBeenCalledWith(
                0,
                10,
                'en-US',
                'latest_draft',
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables article fetch when help center is not loaded', () => {
            mockUseFaqHelpCenterData.mockReturnValue({
                helpCenter: undefined,
                categories: [],
                locales: [],
                isLoading: false,
            } as any)

            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(mockUseGetHelpCenterArticle).toHaveBeenCalledWith(
                1,
                0,
                'en-US',
                'latest_draft',
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('returns article data', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(result.current.article).toBe(mockArticle)
            expect(result.current.isArticleLoading).toBe(false)
        })

        it('returns error state when article fetch fails', () => {
            const mockError = new Error('Fetch failed')
            mockUseGetHelpCenterArticle.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: mockError,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(result.current.isArticleError).toBe(true)
            expect(result.current.articleError).toBe(mockError)
        })
    })

    describe('initial version fetching', () => {
        it('calls useGetArticleTranslationVersion with correct params when initialVersionId is provided', () => {
            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(mockUseGetArticleTranslationVersion).toHaveBeenCalledWith(
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
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(mockUseGetArticleTranslationVersion).toHaveBeenCalledWith(
                expect.objectContaining({
                    version_id: 0,
                }),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables version fetch when help center is not available', () => {
            mockUseFaqHelpCenterData.mockReturnValue({
                helpCenter: undefined,
                categories: [],
                locales: [],
                isLoading: false,
            } as any)

            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(mockUseGetArticleTranslationVersion).toHaveBeenCalledWith(
                expect.objectContaining({
                    help_center_id: 0,
                }),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('disables version fetch when article is not loaded', () => {
            mockUseGetHelpCenterArticle.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
            } as any)

            renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(mockUseGetArticleTranslationVersion).toHaveBeenCalledWith(
                expect.anything(),
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

            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: mockVersionData,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(result.current.initialVersionData).toBe(mockVersionData)
            expect(result.current.isInitialVersionLoading).toBe(false)
        })

        it('returns undefined initialVersionData when version matches published_version_id', () => {
            mockUseGetHelpCenterArticle.mockReturnValue({
                data: {
                    id: 1,
                    translation: {
                        title: 'Test Article',
                        content: 'Test Content',
                        locale: 'en-US',
                        published_version_id: 42,
                        draft_version_id: 50,
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const mockVersionData = {
                id: 42,
                version: 3,
                title: 'Published Title',
                content: 'Published Content',
                published_datetime: '2024-06-01T00:00:00Z',
            }

            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: mockVersionData,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
        })

        it('returns undefined initialVersionData when version matches draft_version_id', () => {
            mockUseGetHelpCenterArticle.mockReturnValue({
                data: {
                    id: 1,
                    translation: {
                        title: 'Test Article',
                        content: 'Test Content',
                        locale: 'en-US',
                        published_version_id: 30,
                        draft_version_id: 42,
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const mockVersionData = {
                id: 42,
                version: 4,
                title: 'Draft Title',
                content: 'Draft Content',
                published_datetime: '2024-05-01T00:00:00Z',
            }

            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: mockVersionData,
                isLoading: false,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(result.current.initialVersionData).toBeUndefined()
        })

        it('returns isInitialVersionLoading true when version is loading and initialVersionId is set', () => {
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(result.current.isInitialVersionLoading).toBe(true)
        })

        it('returns isInitialVersionError when version fetch fails', () => {
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    initialVersionId: 42,
                    isExisting: true,
                }),
            )

            expect(result.current.isInitialVersionError).toBe(true)
        })

        it('returns isInitialVersionLoading false when query is loading but no initialVersionId', () => {
            mockUseGetArticleTranslationVersion.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(result.current.isInitialVersionLoading).toBe(false)
        })
    })

    describe('return value structure', () => {
        it('returns all expected fields', () => {
            const { result } = renderHook(() =>
                useKnowledgeEditorArticleData({
                    helpCenterId: 10,
                    articleId: 1,
                    versionStatus: 'latest_draft',
                    isExisting: true,
                }),
            )

            expect(result.current).toEqual({
                helpCenter: mockHelpCenter,
                categories: [],
                locales: [{ code: 'en-US', name: 'en-US' }],
                isHelpCenterDataLoading: false,
                article: mockArticle,
                isArticleLoading: false,
                isArticleError: false,
                articleError: null,
                initialVersionData: undefined,
                isInitialVersionLoading: false,
                isInitialVersionError: undefined,
            })
        })
    })
})
