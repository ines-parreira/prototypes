import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../../../../tests/render.utils'
import { FIELD_DEFINITIONS } from '../fields'
import { useCustomerFieldPreferences } from '../useCustomerFieldPreferences'

const mockSavePreferences = vi.fn()
let mockWidgetPreferences: { fields: Array<{ id: string; visible: boolean }> }
let mockIsLoading = false

vi.mock('../useWidgetFieldPreferences', () => ({
    useWidgetFieldPreferences: () => ({
        preferences: mockWidgetPreferences,
        savePreferences: mockSavePreferences,
        isLoading: mockIsLoading,
    }),
}))

const ALL_FIELD_IDS = Object.keys(FIELD_DEFINITIONS)

beforeEach(() => {
    mockWidgetPreferences = {
        fields: ALL_FIELD_IDS.map((id) => ({ id, visible: false })),
    }
    mockIsLoading = false
})

describe('useCustomerFieldPreferences', () => {
    it('returns no visible fields when all preferences are hidden', () => {
        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.fields).toHaveLength(0)
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

    it('returns empty fields when preferences fields is not an array', () => {
        mockWidgetPreferences = { fields: 'not-an-array' as never }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.fields).toHaveLength(0)
    })

    it('returns only the fields matching visible preference ids', () => {
        mockWidgetPreferences = {
            fields: [
                { id: 'totalSpent', visible: true },
                { id: 'orders', visible: true },
            ],
        }

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.fields).toHaveLength(2)
        expect(result.current.fields.map((f) => f.id)).toEqual([
            'totalSpent',
            'orders',
        ])
    })

    it('exposes savePreferences and isLoading', () => {
        mockIsLoading = true

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.savePreferences).toBe(mockSavePreferences)
        expect(result.current.isLoading).toBe(true)
    })
})
