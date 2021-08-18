import {getSingleCategoryEnglish} from '../../../pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'
import {getSingleArticleEnglish} from '../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {UpdateCategoryTranslationResponse} from '../types'

import {
    createArticleFromDto,
    createCategoryFromDto,
    createCategoryTranslationFromDto,
    validLocaleCode,
} from '../utils'

describe('Help Center model utils', () => {
    describe('createCategoryTranslationFromDto()', () => {
        it('throws an error if translation is missing', () => {
            expect(createCategoryTranslationFromDto).toThrow()
        })
        it('returns the expected properties', () => {
            const translation: UpdateCategoryTranslationResponse = {
                created_datetime: '2021-06-01T09:46:30.044Z',
                updated_datetime: '2021-06-01T09:46:30.044Z',
                deleted_datetime: null,
                title: 'Orders',
                description:
                    'the arrangement or disposition of people or things in relation to each other according to a particular sequence, pattern, or method.',
                slug: 'orders',
                category_id: 1,
                locale: 'en-US',
            }

            expect(createCategoryTranslationFromDto(translation)).toEqual({
                created_datetime: translation.created_datetime || '',
                updated_datetime: translation.updated_datetime || '',
                deleted_datetime: translation.deleted_datetime || null,
                category_id: translation.category_id,
                locale: translation.locale,
                title: translation.title,
                description: translation.description,
                slug: translation.slug,
            })
        })
    })

    describe('createCategoryFromDto', () => {
        it('throws an error if translation is missing', () => {
            expect(createCategoryFromDto).toThrow()
        })
        it('returns the expected properties', () => {
            const expected = {
                ...getSingleCategoryEnglish,
                position: 0,
                articles: [],
            }

            expect(
                createCategoryFromDto(getSingleCategoryEnglish, 0, [])
            ).toEqual(expected)
        })
    })

    describe('createArticleFromDto', () => {
        it('throws an error if translation is missing', () => {
            expect(createArticleFromDto).toThrow()
        })
        it('returns the expected properties', () => {
            expect(createArticleFromDto(getSingleArticleEnglish, 0)).toEqual({
                ...getSingleArticleEnglish,
                position: 0,
            })
        })
    })

    describe('validLocaleCode', () => {
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
