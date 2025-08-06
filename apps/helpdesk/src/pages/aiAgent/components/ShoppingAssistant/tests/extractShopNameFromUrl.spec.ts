import { extractShopNameFromUrl } from '../utils/extractShopNameFromUrl'

describe('extractShopNameFromUrl', () => {
    it('should extract shop name from a full URL', () => {
        const url = 'https://example.com/app/ai-agent/shopify/my-store/settings'
        expect(extractShopNameFromUrl(url)).toBe('my-store')
    })

    it('should extract shop name from a path', () => {
        const path = '/app/ai-agent/shopify/my-store/dashboard'
        expect(extractShopNameFromUrl(path)).toBe('my-store')
    })

    it('should extract shop name with special characters', () => {
        const path = '/app/ai-agent/shopify/my-store-123/products'
        expect(extractShopNameFromUrl(path)).toBe('my-store-123')
    })

    it('should handle different shop types', () => {
        const path = '/app/ai-agent/bigcommerce/my-store/settings'
        expect(extractShopNameFromUrl(path)).toBe('my-store')
    })

    it("should return undefined for URLs that don't match the pattern", () => {
        const invalidUrl = 'https://example.com/dashboard'
        expect(extractShopNameFromUrl(invalidUrl)).toBeUndefined()
    })

    it('should return undefined for malformed URLs', () => {
        const malformedUrl = '/app/ai-agent/shopify/'
        expect(extractShopNameFromUrl(malformedUrl)).toBeUndefined()
    })
})
