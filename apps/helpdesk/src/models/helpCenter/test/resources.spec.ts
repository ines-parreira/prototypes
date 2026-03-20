import { copyArticle, listIntents } from '../resources'

describe('helpCenter resources', () => {
    describe('copyArticle', () => {
        const mockClient = {
            copyArticle: jest.fn(),
        }
        const mockPathParams = {
            id: 123,
            help_center_id: 456,
        }
        const mockShopName = 'test-shop'
        const mockResponse = { data: { id: 789 } }

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should call client.copyArticle with correct parameters', async () => {
            mockClient.copyArticle.mockResolvedValueOnce(mockResponse)

            const result = await copyArticle(
                mockClient as any,
                mockPathParams,
                mockShopName,
            )

            expect(mockClient.copyArticle).toHaveBeenCalledWith(
                mockPathParams,
                {
                    shop_name: mockShopName,
                },
            )
            expect(result).toEqual(mockResponse)
        })

        it('should return null if client is undefined', async () => {
            const result = await copyArticle(
                undefined,
                mockPathParams,
                mockShopName,
            )

            expect(result).toBeNull()
            expect(mockClient.copyArticle).not.toHaveBeenCalled()
        })

        it('should handle API errors correctly', async () => {
            const error = new Error('API error')
            mockClient.copyArticle.mockRejectedValueOnce(error)

            await expect(
                copyArticle(mockClient as any, mockPathParams, mockShopName),
            ).rejects.toThrow(error)
        })
    })

    describe('listIntents', () => {
        const mockClient = {
            listIntents: jest.fn(),
        }
        const mockPathParams = {
            help_center_id: 123,
        }
        const mockIntentsData = {
            intents: [
                {
                    id: 1,
                    name: 'Shipping Policy',
                    status: 'linked' as const,
                    article_id: 101,
                    article_unlisted_id: 'abc123',
                },
                {
                    id: 2,
                    name: 'Return Policy',
                    status: 'unlinked' as const,
                    article_id: null,
                    article_unlisted_id: null,
                },
            ],
        }
        const mockResponse = { data: mockIntentsData }

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should call client.listIntents with correct parameters', async () => {
            mockClient.listIntents.mockResolvedValueOnce(mockResponse)

            const result = await listIntents(mockClient as any, mockPathParams)

            expect(mockClient.listIntents).toHaveBeenCalledWith(mockPathParams)
            expect(result).toEqual(mockIntentsData)
        })

        it('should return null if client is undefined', async () => {
            const result = await listIntents(undefined, mockPathParams)

            expect(result).toBeNull()
            expect(mockClient.listIntents).not.toHaveBeenCalled()
        })

        it('should handle API errors correctly', async () => {
            const error = new Error('API error')
            mockClient.listIntents.mockRejectedValueOnce(error)

            await expect(
                listIntents(mockClient as any, mockPathParams),
            ).rejects.toThrow(error)
        })

        it('should return response data when successful', async () => {
            const emptyResponse = { data: { intents: [] } }
            mockClient.listIntents.mockResolvedValueOnce(emptyResponse)

            const result = await listIntents(mockClient as any, mockPathParams)

            expect(result).toEqual({ intents: [] })
        })
    })
})
