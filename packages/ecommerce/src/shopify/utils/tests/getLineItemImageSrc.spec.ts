import { describe, expect, it } from 'vitest'

import defaultImage from '../../assets/shopify-product-default-image.png'
import type { OrderLineItem, OrderProduct } from '../../types'
import { getLineItemImageSrc } from '../getLineItemImageSrc'

describe('getLineItemImageSrc', () => {
    const mockLineItem: OrderLineItem = {
        id: 1,
        title: 'Test Product',
        quantity: 1,
        price: '10.00',
        product_id: 123,
        variant_id: 456,
    }

    const mockProduct: OrderProduct = {
        id: 123,
        title: 'Test Product',
        image: {
            src: 'https://cdn.shopify.com/main-image.jpg',
            alt: 'Main image',
            variant_ids: [],
        },
        images: [
            {
                src: 'https://cdn.shopify.com/variant-image.jpg',
                alt: 'Variant image',
                variant_ids: [456],
            },
        ],
    }

    const productWithoutImages: OrderProduct = {
        id: 123,
        title: 'Test Product',
        image: null,
        images: [],
    }

    it.each([
        ['product is undefined', mockLineItem, undefined],
        ['product has no images', mockLineItem, productWithoutImages],
    ])('should return default image when %s', (_, lineItem, product) => {
        const result = getLineItemImageSrc(lineItem, product)
        expect(result).toBe(defaultImage)
    })

    it('should return variant-specific image when available', () => {
        const result = getLineItemImageSrc(mockLineItem, mockProduct)
        expect(result).toBe('//cdn.shopify.com/variant-image_small.jpg')
    })

    it.each([
        ['variant_id does not match', { ...mockLineItem, variant_id: 999 }],
        ['variant_id is null', { ...mockLineItem, variant_id: null }],
    ])('should fall back to main product image when %s', (_, lineItem) => {
        const result = getLineItemImageSrc(lineItem, mockProduct)
        expect(result).toBe('//cdn.shopify.com/main-image_small.jpg')
    })

    it('should return original URL if getSizedImageUrl returns null', () => {
        const productWithSvg: OrderProduct = {
            id: 123,
            title: 'Test Product',
            image: {
                src: 'https://cdn.shopify.com/main-image.svg',
                alt: 'Main image',
                variant_ids: [],
            },
            images: [],
        }
        const result = getLineItemImageSrc(
            { ...mockLineItem, variant_id: null },
            productWithSvg,
        )
        expect(result).toBe('https://cdn.shopify.com/main-image.svg')
    })
})
