import { describe, expect, it } from 'vitest'

import { getSizedImageUrl } from '../getSizedImageUrl'

describe('getSizedImageUrl', () => {
    it.each([
        ['jpg', 'small', '//cdn.shopify.com/image_small.jpg'],
        ['png', 'medium', '//cdn.shopify.com/image_medium.png'],
        ['webp', 'large', '//cdn.shopify.com/image_large.webp'],
    ])(
        'should add %s size suffix to %s image URL',
        (extension, size, expected) => {
            const result = getSizedImageUrl(
                `https://cdn.shopify.com/image.${extension}`,
                size,
            )
            expect(result).toBe(expected)
        },
    )

    it.each([
        ['svg', 'unsupported format'],
        ['', 'URL without file extension'],
    ])('should return null for %s (%s)', (extension) => {
        const url = extension
            ? `https://cdn.shopify.com/image.${extension}`
            : 'https://cdn.shopify.com/image'
        expect(getSizedImageUrl(url, 'small')).toBeNull()
    })

    it('should handle URLs with version query parameter', () => {
        const url = 'https://cdn.shopify.com/image.jpg?v=12345'
        const result = getSizedImageUrl(url, 'small')
        expect(result).toBe('//cdn.shopify.com/image_small.jpg?v=12345')
    })

    it('should remove http protocol', () => {
        const url = 'http://cdn.shopify.com/image.jpg'
        const result = getSizedImageUrl(url, 'small')
        expect(result).toBe('//cdn.shopify.com/image_small.jpg')
    })
})
