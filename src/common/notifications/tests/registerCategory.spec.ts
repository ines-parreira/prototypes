import { categories } from '../data'
import registerCategory from '../registerCategory'
import type { CategoryConfig } from '../types'

jest.mock('../data', () => ({
    categories: [],
}))

describe('registerCategory', () => {
    it('should register a category', () => {
        expect(categories).toEqual([])

        registerCategory({ type: 'boop' } as CategoryConfig)
        expect(categories).toEqual([{ type: 'boop' }])
    })
})
