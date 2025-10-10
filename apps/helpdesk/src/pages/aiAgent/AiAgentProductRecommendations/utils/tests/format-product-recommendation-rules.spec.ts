import { formatProductRecommendationRules } from '../format-product-recommendation-rules'

describe('formatProductRecommendationRules', () => {
    it('returns empty arrays when rules are undefined', () => {
        expect(formatProductRecommendationRules(undefined)).toEqual({
            promote: {
                productIds: [],
                tags: [],
                vendors: [],
                collectionIds: [],
            },
            exclude: {
                productIds: [],
                tags: [],
                vendors: [],
                collectionIds: [],
            },
        })
    })

    it('correctly formats rules', () => {
        expect(
            formatProductRecommendationRules({
                promoted: [
                    {
                        type: 'product',
                        items: [
                            { target: '123456789' },
                            { target: '987654321' },
                        ],
                    },
                    { type: 'tag', items: [] },
                    {
                        type: 'vendor',
                        items: [
                            { target: 'vendor1' },
                            { target: 'vendor2' },
                            { target: 'vendor3' },
                        ],
                    },
                    {
                        type: 'collection',
                        items: [{ target: '456789' }, { target: '654321' }],
                    },
                ],
                excluded: [
                    {
                        type: 'product',
                        items: [
                            { target: '456789123' },
                            { target: '321987654' },
                        ],
                    },
                    { type: 'tag', items: [{ target: 'tag1' }] },
                    { type: 'vendor', items: [{ target: 'vendor4' }] },
                    { type: 'collection', items: [] },
                ],
            }),
        ).toEqual({
            promote: {
                productIds: ['123456789', '987654321'],
                tags: [],
                vendors: ['vendor1', 'vendor2', 'vendor3'],
                collectionIds: ['456789', '654321'],
            },
            exclude: {
                productIds: ['456789123', '321987654'],
                tags: ['tag1'],
                vendors: ['vendor4'],
                collectionIds: [],
            },
        })
    })
})
