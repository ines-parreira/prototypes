import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockFindOpportunityByIdForShopOpportunityHandler } from '@gorgias/knowledge-service-mocks'
import type {
    FindOpportunityByIdForShopOpportunity200,
    KnowledgeGapOpportunityDetail,
} from '@gorgias/knowledge-service-types'

import { OpportunityType } from '../enums'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'
import { useFindOneOpportunity } from './useFindOneOpportunity'

jest.mock('../utils/mapOpportunityDetailToOpportunity', () => ({
    mapOpportunityDetailToOpportunity: jest.fn(),
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

describe('useFindOneOpportunity', () => {
    const mockOpportunityDetailResponse: FindOpportunityByIdForShopOpportunity200 =
        {
            id: 123,
            accountId: 456,
            opportunityType: 'FILL_KNOWLEDGE_GAP',
            shopIntegrationId: 789,
            shopName: 'Test Shop',
            createdDatetime: '2024-01-01T00:00:00Z',
            detectionCount: 5,
            detectionObjectIds: ['1', '2', '3', '4', '5'],
            insight: 'Test opportunity insight',
            knowledgeResource: {
                id: 1,
                sourceId: 'source-123',
                sourceSetId: 'source-set-123',
                title: 'Test Opportunity',
                body: '<p>Test content</p>',
                locale: 'en',
                type: 'article',
                origin: null,
                version: 1,
            },
            resources: [],
        } as KnowledgeGapOpportunityDetail

    const mockMappedOpportunity = {
        id: '123',
        key: 'ks_123',
        title: 'Test Opportunity',
        content: '<p>Test content</p>',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
        detectionObjectIds: ['1', '2', '3', '4', '5'],
        resources: [],
        insight: 'Test insight',
    }

    beforeEach(() => {
        jest.mocked(mapOpportunityDetailToOpportunity).mockReturnValue(
            mockMappedOpportunity,
        )
    })

    it('should request the provided opportunity and map the response', async () => {
        const findOpportunityMock =
            mockFindOpportunityByIdForShopOpportunityHandler(async () =>
                HttpResponse.json(mockOpportunityDetailResponse),
            )
        const waitForFindOpportunityRequest =
            findOpportunityMock.waitForRequest(server)
        server.use(findOpportunityMock.handler)

        const { result } = renderHook(() => useFindOneOpportunity(789, 123))

        await waitForFindOpportunityRequest((request) => {
            const pathname = new URL(request.url).pathname

            expect(pathname).toContain('789')
            expect(pathname).toContain('123')
        })
        await waitFor(() => {
            expect(result.current.data).toEqual(mockMappedOpportunity)
        })
        expect(mapOpportunityDetailToOpportunity).toHaveBeenCalledWith(
            mockOpportunityDetailResponse,
        )
    })

    it('should pass 0 when opportunityId is undefined', async () => {
        const findOpportunityMock =
            mockFindOpportunityByIdForShopOpportunityHandler(async () =>
                HttpResponse.json(mockOpportunityDetailResponse),
            )
        const waitForFindOpportunityRequest =
            findOpportunityMock.waitForRequest(server)
        server.use(findOpportunityMock.handler)

        renderHook(() => useFindOneOpportunity(789, undefined))

        await waitForFindOpportunityRequest((request) => {
            expect(new URL(request.url).pathname).toContain('0')
        })
    })

    it('should not request when disabled', async () => {
        let requestCount = 0
        server.use(
            mockFindOpportunityByIdForShopOpportunityHandler(async () => {
                requestCount += 1

                return HttpResponse.json(mockOpportunityDetailResponse)
            }).handler,
        )

        const { result } = renderHook(() =>
            useFindOneOpportunity(789, 123, {
                query: { enabled: false },
            }),
        )

        await Promise.resolve()

        expect(result.current.fetchStatus).toBe('idle')
        expect(requestCount).toBe(0)
    })
})
