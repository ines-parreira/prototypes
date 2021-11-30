import {getSingleCategoryEnglish} from '../../../pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'
import {getSingleArticleEnglish} from '../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {
    createArticleFromDto,
    createCategoryFromDto,
    validLocaleCode,
} from '../utils'

describe('Help Center model utils', () => {
    describe('createCategoryFromDto()', () => {
        it('returns the expected properties', () => {
            const expected = {
                ...getSingleCategoryEnglish,
                position: 0,
                articles: [],
            }

            expect(createCategoryFromDto(getSingleCategoryEnglish, 0)).toEqual(
                expected
            )
        })
    })

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
})
