import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'

import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import { useGetVersionedArticles } from '../useGetVersionedArticles'

const mockClient = {}

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: () => ({ client: mockClient }),
}))

const mockListArticleTranslationVersions = jest.fn()

jest.mock('models/helpCenter/resources', () => ({
    listArticleTranslationVersions: (...args: unknown[]) =>
        mockListArticleTranslationVersions(...args),
}))

jest.mock('models/helpCenter/queries', () => ({
    helpCenterKeys: {
        articleTranslationVersions: (
            helpCenterId: number,
            articleId: number,
            locale: string,
            queryParams: Record<string, unknown>,
        ) => [
            'helpCenter',
            'articleTranslationVersions',
            helpCenterId,
            articleId,
            locale,
            queryParams,
        ],
    },
}))

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

const createValidArticleResource = (
    overrides?: Partial<KnowledgeReasoningResource>,
): KnowledgeReasoningResource => ({
    resourceId: '10',
    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
    resourceSetId: '5',
    resourceVersion: '3',
    resourceLocale: 'en',
    ...overrides,
})

const mockVersionResponse = {
    data: [
        {
            id: 42,
            title: 'Version Title',
            content: 'Version Content',
            published_datetime: '2024-06-01T00:00:00Z',
        },
    ],
}

describe('useGetVersionedArticles', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = createQueryClient()
    })

    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should return empty map and isLoading false for empty resources', () => {
        const { result } = renderHook(() => useGetVersionedArticles([], true), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.versionedArticlesMap.size).toBe(0)
    })

    it('should filter out resources without version, locale, or setId', () => {
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            {
                resourceId: '2',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceVersion: '1',
            },
            {
                resourceId: '3',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceVersion: '1',
                resourceLocale: 'en',
            },
            {
                resourceId: '4',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceLocale: 'en',
                resourceSetId: '5',
            },
        ]

        const { result } = renderHook(
            () => useGetVersionedArticles(resources, true),
            { wrapper },
        )

        expect(result.current.versionedArticlesMap.size).toBe(0)
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })

    it('should filter out non-versionable types', () => {
        const resources: KnowledgeReasoningResource[] = [
            createValidArticleResource({
                resourceId: '1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
            }),
            createValidArticleResource({
                resourceId: '2',
                resourceType: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            }),
        ]

        const { result } = renderHook(
            () => useGetVersionedArticles(resources, true),
            { wrapper },
        )

        expect(result.current.versionedArticlesMap.size).toBe(0)
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })

    it('should fetch and map a valid ARTICLE resource', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            mockVersionResponse,
        )

        const resource = createValidArticleResource()

        const { result } = renderHook(
            () => useGetVersionedArticles([resource], true),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.versionedArticlesMap.size).toBe(1)
        })

        const entry = result.current.versionedArticlesMap.get('10')
        expect(entry).toEqual({
            title: 'Version Title',
            content: 'Version Content',
            helpCenterId: 5,
            updatedDatetime: '2024-06-01T00:00:00Z',
            versionId: 42,
        })

        expect(mockListArticleTranslationVersions).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 5, article_id: 10, locale: 'en' },
            { number: 3 },
        )
    })

    it('should fetch and map a valid GUIDANCE resource', async () => {
        mockListArticleTranslationVersions.mockResolvedValue(
            mockVersionResponse,
        )

        const resource = createValidArticleResource({
            resourceId: '20',
            resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            resourceSetId: '7',
            resourceVersion: '2',
            resourceLocale: 'fr',
        })

        const { result } = renderHook(
            () => useGetVersionedArticles([resource], true),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.versionedArticlesMap.size).toBe(1)
        })

        const entry = result.current.versionedArticlesMap.get('20')
        expect(entry).toEqual({
            title: 'Version Title',
            content: 'Version Content',
            helpCenterId: 7,
            updatedDatetime: '2024-06-01T00:00:00Z',
            versionId: 42,
        })

        expect(mockListArticleTranslationVersions).toHaveBeenCalledWith(
            mockClient,
            { help_center_id: 7, article_id: 20, locale: 'fr' },
            { number: 2 },
        )
    })

    it('should not create a map entry when fetch returns empty data', async () => {
        mockListArticleTranslationVersions.mockResolvedValue({ data: [] })

        const resource = createValidArticleResource()

        const { result } = renderHook(
            () => useGetVersionedArticles([resource], true),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.versionedArticlesMap.size).toBe(0)
    })

    it('should not execute queries when enabled is false', () => {
        const resource = createValidArticleResource()

        const { result } = renderHook(
            () => useGetVersionedArticles([resource], false),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.versionedArticlesMap.size).toBe(0)
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })

    it('should filter out resourceVersion "0"', () => {
        const resource = createValidArticleResource({
            resourceVersion: '0',
        })

        const { result } = renderHook(
            () => useGetVersionedArticles([resource], true),
            { wrapper },
        )

        expect(result.current.versionedArticlesMap.size).toBe(0)
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })

    it('should filter out non-numeric resourceVersion', () => {
        const resource = createValidArticleResource({
            resourceVersion: 'abc',
        })

        const { result } = renderHook(
            () => useGetVersionedArticles([resource], true),
            { wrapper },
        )

        expect(result.current.versionedArticlesMap.size).toBe(0)
        expect(mockListArticleTranslationVersions).not.toHaveBeenCalled()
    })
})
