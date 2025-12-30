import axios from 'axios'

import type { HelpCenterClient } from 'rest_api/help_center_api/client'

import {
    bulkCopyArticles,
    getHelpCenterArticle,
    getKnowledgeHubArticles,
} from './resources'
import type {
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from './types'
import { KnowledgeHubArticleSourceType } from './types'

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
                draftVersionId: null,
                publishedVersionId: null,
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
                draftVersionId: null,
                publishedVersionId: null,
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

describe('bulkCopyArticles', () => {
    const mockPathParams = {
        help_center_id: 123,
    }

    const mockBody = {
        article_ids: [1, 2, 3],
        shop_names: ['shop-1', 'shop-2'],
    }

    const mockResponse = {
        copied_count: 3,
    }

    it('should return copied count on success', async () => {
        const mockClient = {
            bulkCopyArticles: jest.fn().mockResolvedValue({
                data: mockResponse,
            }),
        } as unknown as HelpCenterClient

        const result = await bulkCopyArticles(
            mockClient,
            mockPathParams,
            mockBody,
        )

        expect(mockClient.bulkCopyArticles).toHaveBeenCalledWith(
            mockPathParams,
            mockBody,
        )
        expect(result).toEqual(mockResponse)
    })

    it('should return null when client is undefined', async () => {
        const result = await bulkCopyArticles(
            undefined,
            mockPathParams,
            mockBody,
        )

        expect(result).toBeNull()
    })

    it('should throw error when API call fails', async () => {
        const mockError = new Error('API Error')
        const mockClient = {
            bulkCopyArticles: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        await expect(
            bulkCopyArticles(mockClient, mockPathParams, mockBody),
        ).rejects.toThrow('API Error')
    })

    it('should pass correct path parameters and body', async () => {
        const mockClient = {
            bulkCopyArticles: jest.fn().mockResolvedValue({
                data: mockResponse,
            }),
        } as unknown as HelpCenterClient

        const pathParams = {
            help_center_id: 456,
        }

        const body = {
            article_ids: [10, 20, 30, 40],
            shop_names: ['test-shop-1', 'test-shop-2', 'test-shop-3'],
        }

        await bulkCopyArticles(mockClient, pathParams, body)

        expect(mockClient.bulkCopyArticles).toHaveBeenCalledWith(
            pathParams,
            body,
        )
    })

    it('should handle empty shop names array', async () => {
        const mockClient = {
            bulkCopyArticles: jest.fn().mockResolvedValue({
                data: { copied_count: 0 },
            }),
        } as unknown as HelpCenterClient

        const body = {
            article_ids: [1, 2],
            shop_names: [],
        }

        const result = await bulkCopyArticles(mockClient, mockPathParams, body)

        expect(mockClient.bulkCopyArticles).toHaveBeenCalledWith(
            mockPathParams,
            body,
        )
        expect(result).toEqual({ copied_count: 0 })
    })

    it('should handle single article and single shop', async () => {
        const mockClient = {
            bulkCopyArticles: jest.fn().mockResolvedValue({
                data: { copied_count: 1 },
            }),
        } as unknown as HelpCenterClient

        const body = {
            article_ids: [1],
            shop_names: ['single-shop'],
        }

        const result = await bulkCopyArticles(mockClient, mockPathParams, body)

        expect(mockClient.bulkCopyArticles).toHaveBeenCalledWith(
            mockPathParams,
            body,
        )
        expect(result).toEqual({ copied_count: 1 })
    })
})

describe('getHelpCenterArticle', () => {
    const mockPathParams = {
        id: 456,
        help_center_id: 123,
    }

    const mockQueryParams = {
        locale: 'en-US' as const,
    }

    const mockArticleResponse = {
        id: 456,
        title: 'Test Article',
        content: 'Test content',
    }

    it('should return article data on success', async () => {
        const mockClient = {
            getArticle: jest.fn().mockResolvedValue({
                data: mockArticleResponse,
            }),
        } as unknown as HelpCenterClient

        const result = await getHelpCenterArticle(
            mockClient,
            mockPathParams,
            mockQueryParams,
        )

        expect(mockClient.getArticle).toHaveBeenCalledWith({
            ...mockPathParams,
            ...mockQueryParams,
        })
        expect(result).toEqual(mockArticleResponse)
    })

    it('should return null when client is undefined', async () => {
        const result = await getHelpCenterArticle(
            undefined,
            mockPathParams,
            mockQueryParams,
        )

        expect(result).toBeNull()
    })

    it('should return null on 404 error when throwOn404 is false', async () => {
        const mockError = {
            isAxiosError: true,
            response: {
                status: 404,
            },
        }
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

        const mockClient = {
            getArticle: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        const result = await getHelpCenterArticle(
            mockClient,
            mockPathParams,
            mockQueryParams,
            { throwOn404: false },
        )

        expect(result).toBeNull()
    })

    it('should return null on 404 error when throwOn404 is not provided', async () => {
        const mockError = {
            isAxiosError: true,
            response: {
                status: 404,
            },
        }
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

        const mockClient = {
            getArticle: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        const result = await getHelpCenterArticle(
            mockClient,
            mockPathParams,
            mockQueryParams,
        )

        expect(result).toBeNull()
    })

    it('should throw error on 404 when throwOn404 is true', async () => {
        const mockError = {
            isAxiosError: true,
            response: {
                status: 404,
            },
            message: 'Article not found',
        }
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

        const mockClient = {
            getArticle: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        await expect(
            getHelpCenterArticle(mockClient, mockPathParams, mockQueryParams, {
                throwOn404: true,
            }),
        ).rejects.toEqual(mockError)
    })

    it('should throw error on non-404 errors', async () => {
        const mockError = {
            isAxiosError: true,
            response: {
                status: 500,
            },
            message: 'Internal Server Error',
        }
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true)

        const mockClient = {
            getArticle: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        await expect(
            getHelpCenterArticle(mockClient, mockPathParams, mockQueryParams),
        ).rejects.toEqual(mockError)
    })

    it('should throw error for non-axios errors', async () => {
        const mockError = new Error('Network Error')
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(false)

        const mockClient = {
            getArticle: jest.fn().mockRejectedValue(mockError),
        } as unknown as HelpCenterClient

        await expect(
            getHelpCenterArticle(mockClient, mockPathParams, mockQueryParams),
        ).rejects.toThrow('Network Error')
    })
})
