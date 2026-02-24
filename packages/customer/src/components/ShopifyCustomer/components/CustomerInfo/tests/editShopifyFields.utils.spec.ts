import { reorderArray } from '../editShopifyFields.utils'

describe('reorderArray', () => {
    it('moves item forward', () => {
        expect(reorderArray(['a', 'b', 'c', 'd'], 0, 2)).toEqual([
            'b',
            'c',
            'a',
            'd',
        ])
    })

    it('moves item backward', () => {
        expect(reorderArray(['a', 'b', 'c', 'd'], 3, 1)).toEqual([
            'a',
            'd',
            'b',
            'c',
        ])
    })

    it('returns equal array when fromIndex equals toIndex', () => {
        const array = ['a', 'b', 'c']
        expect(reorderArray(array, 1, 1)).toEqual(['a', 'b', 'c'])
    })

    it('handles single-element array', () => {
        expect(reorderArray(['a'], 0, 0)).toEqual(['a'])
    })

    it('handles adjacent swap', () => {
        expect(reorderArray(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
    })
})
