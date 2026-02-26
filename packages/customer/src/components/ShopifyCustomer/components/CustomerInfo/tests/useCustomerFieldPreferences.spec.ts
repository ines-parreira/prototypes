import { renderHook } from '@testing-library/react'

import { useCustomerFieldPreferences } from '../useCustomerFieldPreferences'

const mockSetValue = vi.fn()
const mockResetValue = vi.fn()
let mockStoredValue: unknown = undefined

vi.mock('@repo/hooks', () => ({
    useLocalStorage: () => [mockStoredValue, mockSetValue, mockResetValue],
}))

beforeEach(() => {
    mockStoredValue = undefined
})

describe('useCustomerFieldPreferences', () => {
    it('returns all default fields when stored value is not an array', () => {
        mockStoredValue = 'corrupted'

        const { result } = renderHook(() => useCustomerFieldPreferences())

        expect(result.current.fields).toHaveLength(5)
        expect(result.current.fields.map((f) => f.id)).toEqual([
            'tags',
            'totalSpent',
            'createdAt',
            'orders',
            'note',
        ])
    })

    it('returns only the fields matching stored ids', () => {
        mockStoredValue = {
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
})
