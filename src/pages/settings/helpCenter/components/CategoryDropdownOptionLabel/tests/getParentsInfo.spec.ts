import {keyBy as _keyBy} from 'lodash'
import {getCategoriesFlatSorted} from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import {getParentsInfo} from '../CategoryDropdownOptionLabel'

describe('getParentsInfo()', () => {
    it('returns the parent trail', () => {
        const categoriesById = _keyBy(getCategoriesFlatSorted, 'id')
        const category = categoriesById['13']

        expect(getParentsInfo(category, categoriesById)).toEqual(
            'Category 1 > Subcategory 1 1 > Subcategory 1 1 1'
        )
    })

    it('recognizes the top category', () => {
        const categoriesById = _keyBy(getCategoriesFlatSorted, 'id')
        const category = categoriesById['5']
        expect(getParentsInfo(category, categoriesById)).toEqual(
            '< Top Level Category >'
        )
    })
})
