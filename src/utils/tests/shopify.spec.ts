import { IntegrationType } from 'models/integration/constants'

import { getImageSrc, getSizedImageUrl } from '../shopify'

jest.mock(
    'assets/img/presentationals/shopify-product-default-image.png',
    () => 'default-image.png',
)

describe('shopify utils', () => {
    describe('getSizedImageUrl', () => {
        it('should return a sized image URL', () => {
            const src = 'http://example.com/image.jpg'
            const size = 'small'
            expect(getSizedImageUrl(src, size)).toBe(
                '//example.com/image_small.jpg',
            )
        })

        it('should return a sized image URL for HTTPS sources', () => {
            const src = 'https://example.com/image.png'
            const size = 'medium'
            expect(getSizedImageUrl(src, size)).toBe(
                '//example.com/image_medium.png',
            )
        })

        it('should handle URLs with query parameters', () => {
            const src = 'http://example.com/image.jpeg?v=12345'
            const size = 'large'
            expect(getSizedImageUrl(src, size)).toBe(
                '//example.com/image_large.jpeg?v=12345',
            )
        })

        it('should return null if no image extension is found', () => {
            const src = 'http://example.com/image'
            const size = 'small'
            expect(getSizedImageUrl(src, size)).toBeNull()
        })

        it('should handle various image extensions', () => {
            const extensions = ['gif', 'bmp', 'bitmap', 'tiff', 'tif', 'webp']
            extensions.forEach((ext) => {
                const src = `https://example.com/image.${ext}`
                const size = 'pico'
                expect(getSizedImageUrl(src, size)).toBe(
                    `//example.com/image_pico.${ext}`,
                )
            })
        })

        it('should return null for an empty src string', () => {
            const src = ''
            const size = 'small'
            expect(getSizedImageUrl(src, size)).toBeNull()
        })
    })

    describe('getImageSrc', () => {
        it('should return default image if image is null', () => {
            expect(getImageSrc(null)).toBe('default-image.png')
        })

        it('should return default image if image.src is undefined', () => {
            expect(getImageSrc({ alt: 'test' })).toBe('default-image.png')
        })

        it('should return default image if image.src is an empty string', () => {
            expect(getImageSrc({ src: '' })).toBe('default-image.png')
        })

        it('should return sized Shopify image URL', () => {
            const image = {
                src: 'http://cdn.shopify.com/products/123/image.jpg?v=15',
                type: IntegrationType.Shopify,
            }
            expect(getImageSrc(image)).toBe(
                '//cdn.shopify.com/products/123/image_small.jpg?v=15',
            )
        })

        it('should return default image if Shopify image URL is invalid for sizing', () => {
            const image = {
                src: 'http://cdn.shopify.com/products/123/image_no_extension',
                type: IntegrationType.Shopify,
            }
            expect(getImageSrc(image)).toBe('default-image.png')
        })

        it('should return original src if not a Shopify image', () => {
            const image = {
                src: 'http://example.com/other_image.png',
                type: 'OTHER_INTEGRATION' as IntegrationType, // Cast for testing non-Shopify type
            }
            expect(getImageSrc(image)).toBe(
                'http://example.com/other_image.png',
            )
        })

        it('should return default image if src is empty and type is Shopify', () => {
            const image = {
                src: '',
                type: IntegrationType.Shopify,
            }
            expect(getImageSrc(image)).toBe('default-image.png')
        })

        it('should return original src if not a Shopify image and src is valid', () => {
            const image = {
                src: 'https://another-platform.com/pic.gif',
            }
            expect(getImageSrc(image)).toBe(
                'https://another-platform.com/pic.gif',
            )
        })
    })
})
