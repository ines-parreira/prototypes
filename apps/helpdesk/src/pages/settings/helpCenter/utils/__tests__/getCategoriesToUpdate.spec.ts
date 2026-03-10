import { keyBy as _keyBy } from 'lodash'

import type { CategoryTranslation } from 'models/helpCenter/types'

import { HELP_CENTER_DEFAULT_LOCALE } from '../../constants'
import { getCategoriesFlatSorted } from '../../fixtures/getCategoriesTreeFlatSorted.fixtures'
import {
    getCategoriesToUpdate,
    removeElementFromArray,
} from '../getCategoriesToUpdate'

const categories = _keyBy(getCategoriesFlatSorted, 'id')
const translation: CategoryTranslation = {
    image_url: null,
    created_datetime: '2022-03-07T14:47:03.686Z',
    updated_datetime: '2022-03-07T14:47:03.686Z',
    deleted_datetime: null,
    parent_category_id: null,
    customer_visibility: 'PUBLIC',
    description: '',
    title: 'Category 1',
    slug: 'category-1',
    category_id: 5,
    category_unlisted_id: '742929a478954178ad3c7ed00fd6c7f3',
    locale: HELP_CENTER_DEFAULT_LOCALE,
    seo_meta: {
        title: null,
        description: null,
    },
}

describe('getCategoriesToUpdate', () => {
    it('updates the previous parent, the next parent and the category', () => {
        const received = getCategoriesToUpdate({
            categories,
            previousParentId: null,
            currentParentId: 5,
            categoryId: 6,
            translation,
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
            translation,
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
