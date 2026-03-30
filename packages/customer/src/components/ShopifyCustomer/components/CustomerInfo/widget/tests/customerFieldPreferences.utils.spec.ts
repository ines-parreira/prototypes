import type { ShopifyFieldPreferences } from '../../types'
import {
    deriveCustomerFields,
    deriveSections,
} from '../customerFieldPreferences.utils'

describe('deriveCustomerFields', () => {
    it('returns always-visible fields when preferences have no togglable fields', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
        }

        const result = deriveCustomerFields(preferences)

        const ids = result.map((f) => f.id)
        expect(ids).toContain('totalSpent')
        expect(ids).toContain('orders')
        expect(result.length).toBe(2)
    })

    it('includes visible togglable fields after always-visible ones', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [
                { id: 'note', visible: true },
                { id: 'createdAt', visible: false },
            ],
        }

        const result = deriveCustomerFields(preferences)

        const ids = result.map((f) => f.id)
        expect(ids).toContain('totalSpent')
        expect(ids).toContain('orders')
        expect(ids).toContain('note')
        expect(ids).not.toContain('createdAt')
    })

    it('excludes always-visible fields from togglable list even if present in preferences', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [
                { id: 'totalSpent', visible: true },
                { id: 'orders', visible: true },
                { id: 'note', visible: true },
            ],
        }

        const result = deriveCustomerFields(preferences)

        const totalSpentCount = result.filter(
            (f) => f.id === 'totalSpent',
        ).length
        expect(totalSpentCount).toBe(1)
    })

    it('skips fields not defined in FIELD_DEFINITIONS', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [{ id: 'unknownField', visible: true }],
        }

        const result = deriveCustomerFields(preferences)

        const ids = result.map((f) => f.id)
        expect(ids).not.toContain('unknownField')
    })

    it('preserves field order from preferences', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [
                { id: 'createdAt', visible: true },
                { id: 'note', visible: true },
            ],
        }

        const result = deriveCustomerFields(preferences)

        const togglableIds = result
            .filter((f) => !f.alwaysVisible)
            .map((f) => f.id)
        expect(togglableIds).toEqual(['createdAt', 'note'])
    })
})

describe('deriveSections', () => {
    it('returns empty array when no section preferences exist', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
        }

        const result = deriveSections(preferences)

        expect(result).toEqual([])
    })

    it('skips the customer section', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
            sections: {
                customer: {
                    fields: [{ id: 'note', visible: true }],
                },
            },
        }

        const result = deriveSections(preferences)

        expect(result.find((s) => s.key === 'customer')).toBeUndefined()
    })

    it('includes sections with visible fields', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
            sections: {
                defaultAddress: {
                    fields: [
                        { id: 'address1', visible: true },
                        { id: 'city', visible: false },
                    ],
                },
            },
        }

        const result = deriveSections(preferences)

        expect(result).toHaveLength(1)
        expect(result[0].key).toBe('defaultAddress')
        expect(result[0].label).toBe('Default Address')
        expect(result[0].fields.every((f) => f.id === 'address1')).toBe(true)
    })

    it('excludes sections where all fields are hidden', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
            sections: {
                defaultAddress: {
                    fields: [
                        { id: 'address1', visible: false },
                        { id: 'city', visible: false },
                    ],
                },
            },
        }

        const result = deriveSections(preferences)

        expect(result).toHaveLength(0)
    })

    it('derives multiple sections from preferences', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
            sections: {
                defaultAddress: {
                    fields: [{ id: 'address1', visible: true }],
                },
                emailMarketingConsent: {
                    fields: [{ id: 'state', visible: true }],
                },
            },
        }

        const result = deriveSections(preferences)

        const keys = result.map((s) => s.key)
        expect(keys).toContain('defaultAddress')
        expect(keys).toContain('emailMarketingConsent')
    })

    it('skips fields not defined in the section field definitions', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [],
            sections: {
                defaultAddress: {
                    fields: [{ id: 'nonExistentField', visible: true }],
                },
            },
        }

        const result = deriveSections(preferences)

        expect(result).toHaveLength(0)
    })
})
