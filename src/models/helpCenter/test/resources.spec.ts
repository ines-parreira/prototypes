import { copyArticle } from '../resources'

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
})
