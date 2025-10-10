import { getProductStatusData } from '../get-product-status-data'

const emptyRules = { productIds: [], tags: [], vendors: [], collectionIds: [] }

describe('getProductStatusData', () => {
    it('returns Draft badge and tooltip for draft products', () => {
        const result = getProductStatusData(
            { id: '123456789', status: 'draft' },
            'promote',
            { promote: emptyRules, exclude: emptyRules },
        )

        expect(result).toEqual({
            badges: [
                {
                    label: 'Draft',
                    type: 'light-dark',
                    tooltip:
                        'This product’s status is Draft. It will automatically be promoted once its status changes to Active.',
                },
            ],
            description: undefined,
        })
    })

    it('ignores other rules when product is explicitly in same-type product rule', () => {
        const result = getProductStatusData(
            {
                id: '123456789',
                tags: ['tag1', 'tag2', 'tag3'],
                vendor: 'vendor1',
            },
            'exclude',
            {
                promote: emptyRules,
                exclude: {
                    ...emptyRules,
                    productIds: ['123456789'],
                },
            },
        )

        expect(result).toEqual({ badges: [], description: undefined })
    })

    it('shows excluded override when opposite product rule applies', () => {
        const result = getProductStatusData({ id: '123456789' }, 'promote', {
            promote: emptyRules,
            exclude: {
                ...emptyRules,
                productIds: ['123456789'],
            },
        })

        expect(result).toEqual({
            badges: [
                {
                    label: 'Excluded',
                    type: 'light-error',
                },
            ],
            description: 'Excluded by product rule',
        })
    })

    it('aggregates tag/vendor conflicts', () => {
        const result = getProductStatusData(
            { id: '123456789', tags: ['sale', 'new'], vendor: 'Nike' },
            'promote',
            {
                promote: emptyRules,
                exclude: {
                    ...emptyRules,
                    tags: ['sale', 'new'],
                    vendors: ['Nike', 'Adidas'],
                    collectionIds: [],
                },
            },
        )

        expect(result).toEqual({
            badges: [
                {
                    label: 'Excluded',
                    type: 'light-error',
                },
            ],
            description: 'Excluded by tag rule on sale +2 others',
        })
    })

    it('ignores tag/vendor overrides for exclusion type', () => {
        const result = getProductStatusData(
            { id: '123456789', tags: ['sale'], vendor: 'Nike' },
            'exclude',
            {
                exclude: emptyRules,
                promote: {
                    ...emptyRules,
                    tags: ['sale'],
                    vendors: ['Nike', 'Adidas'],
                    collectionIds: [],
                },
            },
        )

        expect(result).toEqual({ badges: [], description: undefined })
    })

    it('shows promoted override for exclusion when opposite product rule applies', () => {
        const result = getProductStatusData({ id: '123456789' }, 'exclude', {
            exclude: emptyRules,
            promote: {
                ...emptyRules,
                productIds: ['123456789'],
            },
        })

        expect(result).toEqual({
            badges: [
                {
                    label: 'Promoted',
                    type: 'light-success',
                },
            ],
            description: 'Promoted by product rule',
        })
    })

    it('returns empty when no rules apply', () => {
        const result = getProductStatusData({ id: '123456789' }, 'promote', {
            promote: emptyRules,
            exclude: emptyRules,
        })

        expect(result).toEqual({ badges: [], description: undefined })
    })
})
