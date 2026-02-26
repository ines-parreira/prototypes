import { act } from '@testing-library/react'

import { renderHook } from '../../../../../tests/render.utils'
import { DEFAULT_FIELDS, FIELD_DEFINITIONS } from '../fields'
import { useCustomerFieldPreferences } from '../useCustomerFieldPreferences'

const STORAGE_KEY = 'shopify-customer-info-fields'

afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
})

describe('useCustomerFieldPreferences', () => {
    it('returns default visible fields matching DEFAULT_FIELD_IDS', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        const fieldIds = result.current.fields.map((f) => f.id)
        expect(fieldIds).toEqual(DEFAULT_FIELDS.map((f) => f.id))
    })

    it('returns all field definitions in preferences', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        const allDefinitionIds = Object.keys(FIELD_DEFINITIONS)
        const preferenceIds = result.current.preferences.fields.map((f) => f.id)
        expect(preferenceIds).toEqual(expect.arrayContaining(allDefinitionIds))
        expect(preferenceIds).toHaveLength(allDefinitionIds.length)
    })

    it('only returns visible fields in the fields array', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        const visiblePrefs = result.current.preferences.fields.filter(
            (f) => f.visible,
        )
        expect(result.current.fields).toHaveLength(visiblePrefs.length)
    })

    it('returns all default fields when stored value is not an array', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify('not-an-array'))

        const { result } = renderHook(() => useCustomerFieldPreferences())

        const fieldIds = result.current.fields.map((f) => f.id)
        expect(fieldIds).toEqual(DEFAULT_FIELDS.map((f) => f.id))
    })

    it('persists updated preferences', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        const updated = {
            fields: [
                { id: 'email', visible: true },
                { id: 'phone', visible: true },
            ],
        }

        act(() => {
            result.current.setPreferences(updated)
        })

        expect(result.current.fields.map((f) => f.id)).toEqual([
            'email',
            'phone',
        ])
    })
})
