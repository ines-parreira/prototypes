import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useFindOpportunityByIdForShopOpportunity } from '@gorgias/knowledge-service-queries'
import type {
    ConflictOpportunityDetail,
    ConflictOpportunityDetailOpportunityType,
} from '@gorgias/knowledge-service-types'

import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { OpportunityType } from '../enums'
import { useCheckOpportunityRelevance } from './useCheckOpportunityRelevance'

jest.mock('models/helpCenter/resources')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
jest.mock('@gorgias/knowledge-service-queries')

const mockGetHelpCenterArticle = getHelpCenterArticle as jest.MockedFunction<
    typeof getHelpCenterArticle
>
const mockUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>
const mockUseFindOpportunityByIdForShopOpportunity =
    useFindOpportunityByIdForShopOpportunity as jest.MockedFunction<
        typeof useFindOpportunityByIdForShopOpportunity
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

const SHOP_INTEGRATION_ID = 456
const OPPORTUNITY_ID = 1

describe('useCheckOpportunityRelevance', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHelpCenterApi.mockReturnValue({
            client: mockClient,
            isReady: true,
        })
    })

    const createMockOpportunity = (
        overrides?: Partial<ConflictOpportunityDetail>,
    ): ConflictOpportunityDetail => ({
        id: 1,
        accountId: 123,
        opportunityType: 'RESOLVE_CONFLICT',
        shopIntegrationId: 456,
        shopName: 'Test Shop',
        createdDatetime: '2024-01-01T00:00:00Z',
        detectionCount: 5,
        detectionObjectIds: ['1', '2', '3'],
        conflictingResources: [],
        resources: [
            {
                resourceId: '100',
                resourceSetId: '1',
                resourceLocale: 'en-US',
                resourceVersion: '5',
                resourceTitle: 'Article 1',
                resourceType: 'article',
            },
        ],
        ...overrides,
    })

    it('returns undefined for non-RESOLVE_CONFLICT opportunities', () => {
        const opportunity = createMockOpportunity({
            opportunityType:
                OpportunityType.FILL_KNOWLEDGE_GAP as ConflictOpportunityDetailOpportunityType,
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it('returns undefined when loading opportunity', () => {
        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBeUndefined()
        expect(result.current.isLoading).toBe(true)
    })

    it('returns undefined when there are no resources', () => {
        const opportunity = createMockOpportunity({
            resources: [],
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.isRelevant).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it('returns false when article fetch fails', async () => {
        const opportunity = createMockOpportunity()

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

        mockGetHelpCenterArticle.mockResolvedValue(null)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
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
        const opportunity = createMockOpportunity({
            resources: [
                {
                    resourceId: '100',
                    resourceSetId: '1',
                    resourceLocale: 'en-US',
                    resourceVersion: null,
                    resourceTitle: 'Article 1',
                    resourceType: 'article',
                },
            ],
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                draft_version_id: 5,
                published_version_id: 5,
            },
        } as any)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
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
        const opportunity = createMockOpportunity({
            resources: [
                {
                    resourceId: '100',
                    resourceSetId: '1',
                    resourceLocale: 'en-US',
                    resourceVersion: '5',
                    resourceTitle: 'Article 1',
                    resourceType: 'article',
                },
            ],
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                draft_version_id: 10,
                published_version_id: 10,
            },
        } as any)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isRelevant).toBe(false)
    })

    it('returns true when draft version matches', async () => {
        const opportunity = createMockOpportunity({
            resources: [
                {
                    resourceId: '100',
                    resourceSetId: '1',
                    resourceLocale: 'en-US',
                    resourceVersion: '5',
                    resourceTitle: 'Article 1',
                    resourceType: 'article',
                },
            ],
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

        mockGetHelpCenterArticle.mockResolvedValue({
            id: 100,
            help_center_id: 1,
            translation: {
                draft_version_id: 5,
                published_version_id: 4,
            },
        } as any)

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
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
        const opportunity = createMockOpportunity({
            resources: [
                {
                    resourceId: '100',
                    resourceSetId: '1',
                    resourceLocale: 'en-US',
                    resourceVersion: '5',
                    resourceTitle: 'Article 1',
                    resourceType: 'article',
                },
                {
                    resourceId: '200',
                    resourceSetId: '2',
                    resourceLocale: 'fr-FR',
                    resourceVersion: '8',
                    resourceTitle: 'Article 2',
                    resourceType: 'article',
                },
            ],
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

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
                            draft_version_id: 8,
                            published_version_id: 7,
                        },
                    } as any
                }
                return null
            },
        )

        const { result } = renderHook(
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
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
        const opportunity = createMockOpportunity({
            resources: [
                {
                    resourceId: '100',
                    resourceSetId: '1',
                    resourceLocale: 'en-US',
                    resourceVersion: '5',
                    resourceTitle: 'Article 1',
                    resourceType: 'article',
                },
                {
                    resourceId: '200',
                    resourceSetId: '2',
                    resourceLocale: 'fr-FR',
                    resourceVersion: '8',
                    resourceTitle: 'Article 2',
                    resourceType: 'article',
                },
            ],
        })

        mockUseFindOpportunityByIdForShopOpportunity.mockReturnValue({
            data: { data: opportunity },
            isLoading: false,
            isError: false,
        } as any)

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
            () =>
                useCheckOpportunityRelevance(
                    SHOP_INTEGRATION_ID,
                    OPPORTUNITY_ID,
                ),
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
