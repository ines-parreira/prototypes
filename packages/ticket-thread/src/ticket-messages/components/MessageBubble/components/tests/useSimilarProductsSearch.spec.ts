import { useSimilarProductsSearch } from '#ticket-messages/components/MessageBubble/components/useSimilarProductSearch'

describe('useSimilarProductsSearch', () => {
    describe('shouldRender: false', () => {
        it('returns false when metadata is null', () => {
            expect(useSimilarProductsSearch(null)).toEqual({
                shouldRender: false,
            })
        })

        it('returns false when metadata is undefined', () => {
            expect(useSimilarProductsSearch(undefined)).toEqual({
                shouldRender: false,
            })
        })

        it('returns false when metadata is an empty object', () => {
            expect(useSimilarProductsSearch({})).toEqual({
                shouldRender: false,
            })
        })

        it('returns false when similar_products_search is missing', () => {
            expect(
                useSimilarProductsSearch({
                    product_reference: {
                        id: 1,
                        title: 'Blush',
                        url: 'https://shop.example.com/blush',
                    },
                }),
            ).toEqual({ shouldRender: false })
        })

        it('returns false when similar_products_search has wrong shape', () => {
            expect(
                useSimilarProductsSearch({
                    similar_products_search: 'not-an-object',
                }),
            ).toEqual({ shouldRender: false })
        })

        it('returns false when similar_products_search is missing required fields', () => {
            expect(
                useSimilarProductsSearch({
                    similar_products_search: { productId: '123' },
                }),
            ).toEqual({ shouldRender: false })
        })
    })

    describe('shouldRender: true', () => {
        const validSimilarProductsSearch = {
            productId: 'prod-123',
            variantId: 'var-456',
        }

        it('returns true when similar_products_search is valid', () => {
            const result = useSimilarProductsSearch({
                similar_products_search: validSimilarProductsSearch,
            })

            expect(result).toEqual({ shouldRender: true })
        })

        it('returns productReference when product_reference is present', () => {
            const result = useSimilarProductsSearch({
                similar_products_search: validSimilarProductsSearch,
                product_reference: {
                    id: 42,
                    title: 'Blush is Life',
                    url: 'https://shop.example.com/blush',
                    featureImageUrl:
                        'https://cdn.example.com/blush-feature.png',
                    variantId: 7,
                },
            })

            expect(result).toEqual({
                shouldRender: true,
                productReference: {
                    id: 42,
                    title: 'Blush is Life',
                    url: 'https://shop.example.com/blush',
                    imageUrl: 'https://cdn.example.com/blush-feature.png',
                    featureImageUrl:
                        'https://cdn.example.com/blush-feature.png',
                    variantId: '7',
                },
            })
        })

        it('maps variant_id number to string', () => {
            const result = useSimilarProductsSearch({
                similar_products_search: validSimilarProductsSearch,
                product_reference: {
                    id: 1,
                    title: 'Product',
                    url: 'https://shop.example.com/product',
                    variantId: 99,
                },
            })

            expect(result.productReference?.variantId).toBe('99')
        })

        it('sets imageUrl to null when featureImageUrl is null', () => {
            const result = useSimilarProductsSearch({
                similar_products_search: validSimilarProductsSearch,
                product_reference: {
                    id: 1,
                    title: 'Product',
                    url: 'https://shop.example.com/product',
                    featureImageUrl: null,
                },
            })

            expect(result.productReference?.imageUrl).toBeNull()
        })

        it('sets imageUrl to null when featureImageUrl is absent', () => {
            const result = useSimilarProductsSearch({
                similar_products_search: validSimilarProductsSearch,
                product_reference: {
                    id: 1,
                    title: 'Product',
                    url: 'https://shop.example.com/product',
                },
            })

            expect(result.productReference?.imageUrl).toBeNull()
        })

        it('leaves productReference undefined when product_reference is absent', () => {
            const result = useSimilarProductsSearch({
                similar_products_search: validSimilarProductsSearch,
            })

            expect(result.productReference).toBeUndefined()
        })
    })
})
