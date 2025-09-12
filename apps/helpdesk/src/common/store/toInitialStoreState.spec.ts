import toInitialStoreState from './toInitialStoreState'

describe('toInitialStoreState', () => {
    const minimalState = {
        tags: { items: [] },
        views: { items: [] },
    }

    it('should preserve currentCompany as plain object while converting other state to Immutable', () => {
        const initialState = {
            ...minimalState,
            currentCompany: {
                fixed_gmv_band: 'tier_2',
            },
            currentAccount: {
                id: 123,
            },
        }

        const result = toInitialStoreState(initialState as any)

        // currentCompany should remain a plain object
        expect(result.currentCompany).toEqual({ fixed_gmv_band: 'tier_2' })
        expect(typeof result.currentCompany).toBe('object')
        expect((result.currentCompany as any).toJS).toBeUndefined()

        // Other state should be converted to Immutable
        expect(result.currentAccount.toJS).toBeDefined()
        expect(result.currentAccount.get('id')).toBe(123)
    })

    it('should handle missing currentCompany', () => {
        const result = toInitialStoreState(minimalState as any)
        expect(result.currentCompany).toBeUndefined()
    })

    it('should preserve currentCompany with any fields', () => {
        const initialState = {
            ...minimalState,
            currentCompany: {
                fixed_gmv_band: 'tier_3',
                other_field: 'value',
            },
        }

        const result = toInitialStoreState(initialState as any)

        expect(result.currentCompany).toEqual({
            fixed_gmv_band: 'tier_3',
            other_field: 'value',
        })
    })
})
