import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockFindOpportunitiesByTicketIdOpportunityHandler } from '@gorgias/knowledge-service-mocks'
import type { FindOpportunitiesByTicketIdOpportunity200Item } from '@gorgias/knowledge-service-types'

import { useAppSelector } from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { useHasAccessToOpportunities } from 'pages/aiAgent/opportunities/hooks/useHasAccessToOpportunities'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../types'
import { ResourceType } from '../types'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'
import { useFindTopOpportunityByTicketId } from './useFindTopOpportunityByTicketId'

jest.mock('../utils/mapOpportunityDetailToOpportunity', () => ({
    mapOpportunityDetailToOpportunity: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/opportunities/hooks/useHasAccessToOpportunities',
    () => ({
        useHasAccessToOpportunities: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector')

jest.mock('state/integrations/selectors', () => ({
    getIntegrationByIdAndType: jest.fn(),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useFindTopOpportunityByTicketId', () => {
    const mockOpportunityDetail1: FindOpportunitiesByTicketIdOpportunity200Item =
        {
            id: 123,
            accountId: 456,
            opportunityType: 'FILL_KNOWLEDGE_GAP',
            shopIntegrationId: 789,
            shopName: 'Test Shop',
            createdDatetime: '2024-01-01T00:00:00Z',
            detectionCount: 5,
            detectionObjectIds: ['1', '2', '3', '4', '5'],
            insight: 'Test knowledge gap opportunity',
            knowledgeResource: {
                id: 1,
                sourceId: 'source-123',
                sourceSetId: 'source-set-123',
                title: 'Test Knowledge Gap',
                body: '<p>Test content</p>',
                locale: 'en',
                type: 'article',
                origin: null,
                version: 1,
            },
            resources: [],
        } as FindOpportunitiesByTicketIdOpportunity200Item

    const mockOpportunityDetail2: FindOpportunitiesByTicketIdOpportunity200Item =
        {
            id: 456,
            accountId: 456,
            opportunityType: 'RESOLVE_CONFLICT',
            shopIntegrationId: 789,
            shopName: 'Test Shop',
            createdDatetime: '2024-01-02T00:00:00Z',
            detectionCount: 3,
            detectionObjectIds: ['6', '7', '8'],
            insight: 'Test conflict opportunity',
            resources: [
                {
                    id: 1,
                    sourceId: 'source-1',
                    sourceSetId: 'source-set-1',
                    title: 'Resource 1',
                    body: '<p>Content 1</p>',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: 1,
                    insight: 'Insight 1',
                },
            ],
        } as unknown as FindOpportunitiesByTicketIdOpportunity200Item

    const mockMappedOpportunity1: Opportunity = {
        id: '123',
        key: 'ks_123',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
        detectionObjectIds: ['1', '2', '3', '4', '5'],
        insight: 'Test knowledge gap opportunity',
        resources: [],
    }

    const mockMappedOpportunity2: Opportunity = {
        id: '456',
        key: 'ks_456',
        type: OpportunityType.RESOLVE_CONFLICT,
        ticketCount: 3,
        detectionObjectIds: ['6', '7', '8'],
        insight: 'Test conflict opportunity',
        resources: [
            {
                title: 'Resource 1',
                content: '<p>Content 1</p>',
                type: ResourceType.ARTICLE,
                isVisible: false,
                insight: 'Insight 1',
            },
        ],
    }

    const mockShopIntegration = {
        id: 789,
        name: 'test-shop',
        type: IntegrationType.Shopify,
    }

    beforeEach(() => {
        jest.mocked(useFlag).mockImplementation((flag) => {
            return [
                FeatureFlagKey.IncreaseVisibilityOfOpportunity,
                FeatureFlagKey.OpportunitiesMilestone2,
            ].includes(flag)
        })
        jest.mocked(useHasAccessToOpportunities).mockReturnValue(true)
        jest.mocked(useAppSelector).mockReturnValue(mockShopIntegration)
        jest.mocked(getIntegrationByIdAndType).mockReturnValue(
            (() => mockShopIntegration) as unknown as ReturnType<
                typeof getIntegrationByIdAndType
            >,
        )
        jest.mocked(mapOpportunityDetailToOpportunity).mockImplementation(
            (detail) =>
                detail.id === 456
                    ? mockMappedOpportunity2
                    : mockMappedOpportunity1,
        )
    })

    it('should request ticket opportunities and prioritize conflict opportunities', async () => {
        const findOpportunitiesMock =
            mockFindOpportunitiesByTicketIdOpportunityHandler(async () =>
                HttpResponse.json([
                    mockOpportunityDetail1,
                    mockOpportunityDetail2,
                ]),
            )
        const waitForFindOpportunitiesRequest =
            findOpportunitiesMock.waitForRequest(server)
        server.use(findOpportunitiesMock.handler)

        const { result } = renderHook(() =>
            useFindTopOpportunityByTicketId(789, '12345'),
        )

        await waitForFindOpportunitiesRequest((request) => {
            const pathname = new URL(request.url).pathname

            expect(pathname).toContain('789')
            expect(pathname).toContain('12345')
        })
        await waitFor(() => {
            expect(result.current.topOpportunity).toEqual(
                mockMappedOpportunity2,
            )
        })
    })

    it('should select the opportunity with higher ticket count when types match', async () => {
        const lowerCountOpportunity = {
            ...mockMappedOpportunity1,
            id: '111',
            ticketCount: 5,
        }
        const higherCountOpportunity = {
            ...mockMappedOpportunity1,
            id: '222',
            ticketCount: 10,
        }
        jest.mocked(mapOpportunityDetailToOpportunity).mockImplementation(
            (detail) =>
                detail.id === 222
                    ? higherCountOpportunity
                    : lowerCountOpportunity,
        )
        server.use(
            mockFindOpportunitiesByTicketIdOpportunityHandler(async () =>
                HttpResponse.json([
                    mockOpportunityDetail1,
                    {
                        ...mockOpportunityDetail1,
                        id: 222,
                    },
                ]),
            ).handler,
        )

        const { result } = renderHook(() =>
            useFindTopOpportunityByTicketId(789, '12345'),
        )

        await waitFor(() => {
            expect(result.current.topOpportunity).toEqual(
                higherCountOpportunity,
            )
        })
    })

    it('should not request when feature flags disable opportunities', async () => {
        let requestCount = 0
        jest.mocked(useFlag).mockReturnValue(false)
        server.use(
            mockFindOpportunitiesByTicketIdOpportunityHandler(async () => {
                requestCount += 1

                return HttpResponse.json([mockOpportunityDetail1])
            }).handler,
        )

        const { result } = renderHook(() =>
            useFindTopOpportunityByTicketId(789, '12345'),
        )

        await Promise.resolve()

        expect(result.current.topOpportunity).toBeNull()
        expect(requestCount).toBe(0)
    })

    it('should not request when ticket id is empty', async () => {
        let requestCount = 0
        server.use(
            mockFindOpportunitiesByTicketIdOpportunityHandler(async () => {
                requestCount += 1

                return HttpResponse.json([mockOpportunityDetail1])
            }).handler,
        )

        const { result } = renderHook(() =>
            useFindTopOpportunityByTicketId(789, ''),
        )

        await Promise.resolve()

        expect(result.current.topOpportunity).toBeNull()
        expect(requestCount).toBe(0)
    })
})
