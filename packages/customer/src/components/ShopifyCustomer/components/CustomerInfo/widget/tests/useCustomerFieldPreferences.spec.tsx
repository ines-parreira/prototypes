import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../../../../../tests/render.utils'
import { FIELD_DEFINITIONS } from '../../fieldDefinitions/fields'
import type { ShopifyFieldPreferences } from '../../types'
import { useCustomerFieldPreferences } from '../useCustomerFieldPreferences'

const mockSavePreferences = vi.fn()
let mockWidgetPreferences: ShopifyFieldPreferences
let mockIsLoading = false

vi.mock('../useWidgetFieldPreferences', () => ({
    useWidgetFieldPreferences: () => ({
        preferences: mockWidgetPreferences,
        savePreferences: mockSavePreferences,
        isLoading: mockIsLoading,
    }),
}))

const ALL_FIELD_IDS = Object.keys(FIELD_DEFINITIONS)
const ALWAYS_VISIBLE_FIELDS = Object.values(FIELD_DEFINITIONS).filter(
    (f) => f.alwaysVisible,
)

beforeEach(() => {
    mockWidgetPreferences = {
        fields: ALL_FIELD_IDS.map((id) => ({ id, visible: false })),
    }
    mockIsLoading = false
})

describe('useCustomerFieldPreferences', () => {
    it('always returns always-visible fields even when all preferences are hidden', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.customerFields).toHaveLength(
            ALWAYS_VISIBLE_FIELDS.length,
        )
        for (const { id } of ALWAYS_VISIBLE_FIELDS) {
            expect(
                result.current.customerFields.find((f) => f.id === id),
            ).toBeDefined()
        }
    })

    it('returns all field definitions in preferences', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        const allDefinitionIds = Object.keys(FIELD_DEFINITIONS)
        const preferenceIds = result.current.preferences.fields.map((f) => f.id)
        expect(preferenceIds).toEqual(expect.arrayContaining(allDefinitionIds))
        expect(preferenceIds).toHaveLength(allDefinitionIds.length)
    })

    it('returns only visible preference fields plus always-visible fields', () => {
        mockWidgetPreferences = {
            fields: [
                { id: 'totalSpent', visible: true },
                { id: 'orders', visible: true },
                { id: 'createdAt', visible: true },
                { id: 'note', visible: false },
            ],
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.customerFields.map((f) => f.id)).toEqual([
            'totalSpent',
            'orders',
            'createdAt',
        ])
    })

    it('always-visible fields appear first, before togglable fields', () => {
        mockWidgetPreferences = {
            fields: [
                { id: 'createdAt', visible: true },
                { id: 'note', visible: true },
            ],
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        const ids = result.current.customerFields.map((f) => f.id)
        expect(ids[0]).toBe('totalSpent')
        expect(ids[1]).toBe('orders')
        expect(ids).toContain('createdAt')
        expect(ids).toContain('note')
    })

    it('does not duplicate always-visible fields when they appear in preferences', () => {
        mockWidgetPreferences = {
            fields: [
                { id: 'totalSpent', visible: true },
                { id: 'orders', visible: true },
                { id: 'createdAt', visible: true },
            ],
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        const totalSpentCount = result.current.customerFields.filter(
            (f) => f.id === 'totalSpent',
        ).length
        expect(totalSpentCount).toBe(1)
    })

    it('returns empty customer fields when preferences fields is not an array', () => {
        mockWidgetPreferences = { fields: 'not-an-array' as never }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.customerFields).toHaveLength(
            ALWAYS_VISIBLE_FIELDS.length,
        )
    })

    it('exposes savePreferences and isLoading', () => {
        mockIsLoading = true

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.savePreferences).toBe(mockSavePreferences)
        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty sections when no section preferences exist', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.sections).toHaveLength(0)
    })

    it('returns sections with visible fields', () => {
        mockWidgetPreferences = {
            fields: ALL_FIELD_IDS.map((id) => ({ id, visible: false })),
            sections: {
                defaultAddress: {
                    fields: [
                        { id: 'address1', visible: true },
                        { id: 'city', visible: true },
                        { id: 'country', visible: false },
                    ],
                },
            },
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.sections).toHaveLength(1)
        expect(result.current.sections[0].key).toBe('defaultAddress')
        expect(result.current.sections[0].fields).toHaveLength(2)
        expect(result.current.sections[0].fields.map((f) => f.id)).toEqual([
            'address1',
            'city',
        ])
    })

    it('excludes sections where all fields are hidden', () => {
        mockWidgetPreferences = {
            fields: ALL_FIELD_IDS.map((id) => ({ id, visible: false })),
            sections: {
                defaultAddress: {
                    fields: [
                        { id: 'address1', visible: false },
                        { id: 'city', visible: false },
                    ],
                },
            },
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.sections).toHaveLength(0)
    })

    it('does not include customer section in sections array', () => {
        mockWidgetPreferences = {
            fields: [{ id: 'totalSpent', visible: true }],
            sections: {
                customer: {
                    fields: [{ id: 'totalSpent', visible: true }],
                },
                emailMarketingConsent: {
                    fields: [{ id: 'state', visible: true }],
                },
            },
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(
            result.current.sections.find((s) => s.key === 'customer'),
        ).toBeUndefined()
        expect(result.current.sections).toHaveLength(1)
        expect(result.current.sections[0].key).toBe('emailMarketingConsent')
    })
})
