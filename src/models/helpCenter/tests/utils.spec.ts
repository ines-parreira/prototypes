import {LocaleCode} from '../types'

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
            const translation = {
                created_datetime: '2021-06-01T09:46:30.044Z',
                updated_datetime: '2021-06-01T09:46:30.044Z',
                deleted_datetime: null,
                id: 1,
                title: 'Orders',
                description:
                    'the arrangement or disposition of people or things in relation to each other according to a particular sequence, pattern, or method.',
                slug: 'orders',
                category_id: 1,
                locale: 'en-US' as LocaleCode,
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
        const response = {
            created_datetime: '2021-06-01T09:46:30.044Z',
            updated_datetime: '2021-06-01T09:46:30.044Z',
            deleted_datetime: null,
            id: 1,
            help_center_id: 1,
            translation: {
                created_datetime: '2021-06-01T09:46:30.044Z',
                updated_datetime: '2021-06-01T09:46:30.044Z',
                deleted_datetime: null,
                title: 'Orders',
                description:
                    'the arrangement or disposition of people or things in relation to each other according to a particular sequence, pattern, or method.',
                slug: 'orders',
                category_id: 1,
                locale: 'en-US' as LocaleCode,
            },
        }
        it('throws an error if translation is missing', () => {
            expect(createCategoryFromDto).toThrow()
        })
        it('returns the expected properties', () => {
            expect(createCategoryFromDto(response, 0, [])).toEqual({
                ...response,
                position: 0,
                articles: [],
            })
        })
    })

    describe('createArticleFromDto', () => {
        const response = {
            id: 1,
            category_id: null,
            help_center_id: 1,
            created_datetime: '2021-05-17T18:21:42.022Z',
            updated_datetime: '2021-05-17T18:21:42.022Z',
            deleted_datetime: undefined,
            translation: {
                title: 'Free article (EN)',
                excerpt: 'Paragraph lorem ipsum, Yiddish xylophone wonder.',
                slug: 'free-article',
                article_id: 1,
                created_datetime: '2021-05-17T18:21:42.022Z',
                updated_datetime: '2021-05-17T18:21:42.022Z',
                deleted_datetime: undefined,
                locale: 'en-US' as LocaleCode,
                content: 'Article content',
            },
        }

        it('throws an error if translation is missing', () => {
            expect(createArticleFromDto).toThrow()
        })
        it('returns the expected properties', () => {
            expect(createArticleFromDto(response, 0)).toEqual({
                ...response,
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
