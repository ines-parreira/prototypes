import {keyBy as _keyBy} from 'lodash'
import {getCategoriesFlatSorted} from '../../fixtures/getCategoriesTreeFlatSorted.fixtures'
import {
    getCategoriesToUpdate,
    removeElementFromArray,
} from '../getCategoriesToUpdate'

const categories = _keyBy(getCategoriesFlatSorted, 'id')

describe('getCategoriesToUpdate', () => {
    it('updates the previous parent, the next parent and the category', () => {
        const received = getCategoriesToUpdate({
            categories,
            previousParentId: null,
            currentParentId: 5,
            categoryId: 6,
        })

        expect(received.length).toEqual(3)
        expect(received[0].translation?.parent_category_id).toEqual(5)
        expect(received[1].children).not.toContain(6)
        expect(received[2].children).toContain(6)
    })

    it('does not update anything', () => {
        const received = getCategoriesToUpdate({
            categories,
            previousParentId: null,
            currentParentId: null,
            categoryId: 6,
        })

        expect(received.length).toEqual(0)
    })

    it('removes the correct element from the array', () => {
        const arr = [1, 20, 13, 43]
        const elementToRemove = 20
        expect(removeElementFromArray(arr, elementToRemove)).toEqual([
            1, 13, 43,
        ])
    })
})
