import { HelpCenterClient } from 'rest_api/help_center_api/client'

import { getKnowledgeHubArticles } from './resources'
import {
    KnowledgeHubArticleSourceType,
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from './types'

describe('getKnowledgeHubArticles', () => {
    const mockQueryParams: KnowledgeHubArticlesQueryParams = {
        account_id: 123,
        guidance_help_center_id: 1,
        snippet_help_center_id: 2,
        faq_help_center_id: 3,
    }

    const mockResponse: KnowledgeHubArticlesResponse = {
        articles: [
            {
                id: 1,
                title: 'Test Article 1',
                type: KnowledgeHubArticleSourceType.FaqHelpCenter,
                updatedDatetime: '2024-01-15T10:00:00Z',
                createdDatetime: '2024-01-01T10:00:00Z',
                visibilityStatus: 'PUBLIC',
                source: 'test-source.com',
                localeCode: 'en-US',
                shopName: 'test-shop',
            },
            {
                id: 2,
                title: 'Test Article 2',
                type: KnowledgeHubArticleSourceType.GuidanceHelpCenter,
                updatedDatetime: '2024-01-20T10:00:00Z',
                createdDatetime: '2024-01-05T10:00:00Z',
                visibilityStatus: 'UNLISTED',
                source: 'another-source.com',
                localeCode: 'en-US',
                shopName: 'test-shop',
            },
        ],
    }

    it('should return articles data on success', async () => {
        const mockClient = {
            get: jest.fn().mockResolvedValue({
                data: mockResponse,
            }),
        } as unknown as HelpCenterClient

        const result = await getKnowledgeHubArticles(
            mockClient,
            mockQueryParams,
        )

        expect(mockClient.get).toHaveBeenCalledWith(
            '/api/help-center/help-centers/knowledge-hub-articles',
            {
                params: mockQueryParams,
            },
        )
        expect(result).toEqual(mockResponse)
    })

    it('should return null when client is undefined', async () => {
        const result = await getKnowledgeHubArticles(undefined, mockQueryParams)

        expect(result).toBeNull()
    })

    it('should throw error when API call fails', async () => {
        const mockError = new Error('API Error')
        const mockClient = {
            get: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        await expect(
            getKnowledgeHubArticles(mockClient, mockQueryParams),
        ).rejects.toThrow('API Error')
    })

    it('should pass correct query parameters', async () => {
        const mockClient = {
            get: jest.fn().mockResolvedValue({
                data: mockResponse,
            }),
        } as unknown as HelpCenterClient

        const queryParams: KnowledgeHubArticlesQueryParams = {
            account_id: 456,
            guidance_help_center_id: 10,
            snippet_help_center_id: null,
            faq_help_center_id: null,
        }

        await getKnowledgeHubArticles(mockClient, queryParams)

        expect(mockClient.get).toHaveBeenCalledWith(
            '/api/help-center/help-centers/knowledge-hub-articles',
            {
                params: queryParams,
            },
        )
    })

    it('should handle empty articles response', async () => {
        const emptyResponse: KnowledgeHubArticlesResponse = {
            articles: [],
        }

        const mockClient = {
            get: jest.fn().mockResolvedValue({
                data: emptyResponse,
            }),
        } as unknown as HelpCenterClient

        const result = await getKnowledgeHubArticles(
            mockClient,
            mockQueryParams,
        )

        expect(result).toEqual(emptyResponse)
    })

    it('should work with minimal query parameters', async () => {
        const mockClient = {
            get: jest.fn().mockResolvedValue({
                data: mockResponse,
            }),
        } as unknown as HelpCenterClient

        const minimalParams: KnowledgeHubArticlesQueryParams = {
            account_id: 789,
        }

        const result = await getKnowledgeHubArticles(mockClient, minimalParams)

        expect(mockClient.get).toHaveBeenCalledWith(
            '/api/help-center/help-centers/knowledge-hub-articles',
            {
                params: minimalParams,
            },
        )
        expect(result).toEqual(mockResponse)
    })
})
