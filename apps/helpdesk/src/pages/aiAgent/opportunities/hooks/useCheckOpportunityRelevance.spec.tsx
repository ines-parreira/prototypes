import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../types'
import { ResourceType } from '../types'
import { useCheckOpportunityRelevance } from './useCheckOpportunityRelevance'

jest.mock('models/helpCenter/resources')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')

const mockGetHelpCenterArticle = getHelpCenterArticle as jest.MockedFunction<
    typeof getHelpCenterArticle
>
const mockUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const mockClient = {} as any

describe('useCheckOpportunityRelevance', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHelpCenterApi.mockReturnValue({
            client: mockClient,
            isReady: true,
        })
    })

    const createMockOpportunity = (
        type: OpportunityType = OpportunityType.RESOLVE_CONFLICT,
        resources: Opportunity['resources'] = [],
    ): Opportunity => ({
        id: '1',
        key: 'ai_1',
        type,
        insight: 'Test opportunity insight',
        ticketCount: 5,
        detectionObjectIds: ['1', '2', '3'],
        resources,
    })

    it('returns true for non-RESOLVE_CONFLICT opportunities', () => {
        const opportunity = createMockOpportunity(
            OpportunityType.FILL_KNOWLEDGE_GAP,
        )

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns true when opportunity is undefined', () => {
        const { result } = renderHook(
            () => useCheckOpportunityRelevance(undefined),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns true when there are no resources', () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [],
        )

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns true when resources property is undefined', () => {
        const opportunity: Opportunity = {
            id: '1',
            key: 'ai_1',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Test opportunity with no resources',
            ticketCount: 5,
            detectionObjectIds: ['1', '2', '3'],
            resources: [],
        }

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns true when resources have no identifiers', () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                },
            ],
        )

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('filters out resources without identifiers from mixed resources', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article without identifiers',
                    content: 'Content',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                },
                {
                    title: 'Article with identifiers',
                    content: 'Content',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                is_current: true,
                version: 5,
            },
        } as any)

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(true)
    })

    it('returns isRelevant true while loading', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(
                        () =>
                            resolve({
                                id: 100,
                                help_center_id: 1,
                                translation: {
                                    is_current: true,
                                    version: 5,
                                },
                            } as any),
                        100,
                    )
                }),
        )

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBe(true)
        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(true)
    })

    it('returns false when article fetch fails', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockResolvedValue(null)

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(false)
    })

    it('returns false when resource has no version', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: null,
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                draft_version_id: 5,
                published_version_id: 5,
            },
        } as any)

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(false)
    })

    it('returns false when version does not match', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                draft_version_id: 10,
                published_version_id: 10,
            },
        } as any)

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(false)
    })

    it('returns true when version matches', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                is_current: true,
                version: 5,
            },
        } as any)

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(true)
    })

    it('returns true when all resources match across different help centers', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
                {
                    title: 'Article 2',
                    content: 'Content 2',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '200',
                        resourceSetId: '2',
                        resourceLocale: 'fr-FR',
                        resourceVersion: '8',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockImplementation(
            async (_client, pathParams) => {
                if (pathParams.id === 100) {
                    return {
                        id: 100,
                        help_center_id: 1,
                        translation: {
                            is_current: true,
                            version: 5,
                        },
                    } as any
                }
                if (pathParams.id === 200) {
                    return {
                        id: 200,
                        help_center_id: 2,
                        translation: {
                            is_current: false,
                            version: 8,
                        },
                    } as any
                }
                return null
            },
        )

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(true)
    })

    it('returns false when one resource fails to match among multiple', async () => {
        const opportunity = createMockOpportunity(
            OpportunityType.RESOLVE_CONFLICT,
            [
                {
                    title: 'Article 1',
                    content: 'Content 1',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '100',
                        resourceSetId: '1',
                        resourceLocale: 'en-US',
                        resourceVersion: '5',
                    },
                },
                {
                    title: 'Article 2',
                    content: 'Content 2',
                    type: ResourceType.ARTICLE,
                    isVisible: true,
                    identifiers: {
                        resourceId: '200',
                        resourceSetId: '2',
                        resourceLocale: 'fr-FR',
                        resourceVersion: '8',
                    },
                },
            ],
        )

        mockGetHelpCenterArticle.mockImplementation(
            async (_client, pathParams) => {
                if (pathParams.id === 100) {
                    return {
                        id: 100,
                        help_center_id: 1,
                        translation: {
                            draft_version_id: 5,
                            published_version_id: 5,
                        },
                    } as any
                }
                if (pathParams.id === 200) {
                    return {
                        id: 200,
                        help_center_id: 2,
                        translation: {
                            draft_version_id: 10,
                            published_version_id: 9,
                        },
                    } as any
                }
                return null
            },
        )

        const { result } = renderHook(
            () => useCheckOpportunityRelevance(opportunity),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(false)
    })
})
