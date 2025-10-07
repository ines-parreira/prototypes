import { extractShopTypeFromUrl } from '../utils/extractShopTypeFromUrl'

describe('extractShopTypeFromUrl', () => {
    it('should extract shop type from a full URL', () => {
        const url = 'https://example.com/app/ai-agent/shopify/my-store/settings'
        expect(extractShopTypeFromUrl(url)).toBe('shopify')
    })

    it('should extract shop type from a path', () => {
        const path = '/app/ai-agent/bigcommerce/my-store/dashboard'
        expect(extractShopTypeFromUrl(path)).toBe('bigcommerce')
    })

    it('should extract shop type with special characters', () => {
        const path = '/app/ai-agent/woo-commerce/my-store/products'
        expect(extractShopTypeFromUrl(path)).toBe('woo-commerce')
    })

    it('should handle different shop types', () => {
        const path = '/app/ai-agent/magento/my-store/settings'
        expect(extractShopTypeFromUrl(path)).toBe('magento')
    })

    it("should return undefined for URLs that don't match the pattern", () => {
        const invalidUrl = 'https://example.com/dashboard'
        expect(extractShopTypeFromUrl(invalidUrl)).toBeUndefined()
    })

    it('should return undefined for malformed URLs', () => {
        const malformedUrl = '/app/ai-agent/'
        expect(extractShopTypeFromUrl(malformedUrl)).toBeUndefined()
    })
})
