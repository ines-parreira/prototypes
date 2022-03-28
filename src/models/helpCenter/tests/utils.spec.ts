import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getCategoriesResponseEnglish} from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import {getCategoriesFlatSorted} from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'

import {
    createArticleFromDto,
    flattenCategories,
    validLocaleCode,
} from '../utils'

describe('Help Center model utils', () => {
    describe('createArticleFromDto()', () => {
        it('returns the expected properties', () => {
            const expected = {
                ...getSingleArticleEnglish,
                position: 0,
            }

            expect(createArticleFromDto(getSingleArticleEnglish, 0)).toEqual(
                expected
            )
        })
    })

    describe('validLocaleCode()', () => {
        it('returns the localeCode if is valid', () => {
            expect(validLocaleCode('en-US')).toEqual('en-US')
        })

        it.each([['latin'], ['']])(
            'throws error if the locale code is not recognized',
            (value: string) => {
                expect(() => validLocaleCode(value)).toThrow()
            }
        )
    })

    describe('flattenCategories(category)', () => {
        it('returns an array with flat categories', () => {
            const rootCategory = getCategoriesResponseEnglish
            const expectedResult = getCategoriesFlatSorted

            expect(flattenCategories(rootCategory)).toEqual(expectedResult)
        })
    })
})
