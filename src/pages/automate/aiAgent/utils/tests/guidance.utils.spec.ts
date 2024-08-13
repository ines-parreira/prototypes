import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getGuidanceArticleFixture} from '../../fixtures/guidanceArticle.fixture'
import {UpdateGuidanceArticle} from '../../types'
import {
    mapGuidanceToArticleApi,
    mapUpdateGuidanceArticleToArticleApi,
    mapArticleApiToGuidanceArticle,
    mapGuidanceFormFieldsToGuidanceArticle,
} from '../guidance.utils'

const guidanceArticle = getGuidanceArticleFixture(1, {
    templateKey: 'templateKey',
})

describe('guidance.utils', () => {
    describe('mapGuidanceToArticleApi', () => {
        it('should map guidance article to create article DTO', () => {
            const expected = {
                template_key: 'templateKey',
                translation: {
                    locale: guidanceArticle.locale,
                    title: guidanceArticle.title,
                    content: guidanceArticle.content,
                    visibility_status: 'PUBLIC',
                    excerpt: '',
                    slug: 'title-1',
                    seo_meta: {
                        description: null,
                        title: null,
                    },
                },
            }

            const result = mapGuidanceToArticleApi(guidanceArticle)

            expect(result).toEqual(expected)
        })
    })

    describe('mapUpdateGuidanceArticleToArticleApi', () => {
        it('should map update guidance article to update article translation DTO', () => {
            const updateGuidanceArticle: UpdateGuidanceArticle = {
                title: 'Updated Title',
                content: 'Updated Content',
                visibility: 'UNLISTED',
            }

            const expected = {
                title: 'Updated Title',
                content: 'Updated Content',
                visibility_status: 'UNLISTED',
                slug: 'updated-title',
            }

            const result = mapUpdateGuidanceArticleToArticleApi(
                updateGuidanceArticle
            )

            expect(result).toEqual(expected)
        })
    })

    describe('mapArticleApiToGuidanceArticle', () => {
        it('should map article API response to guidance article', () => {
            const article = getSingleArticleEnglish

            const expected = {
                id: article.id,
                title: article.translation.title,
                content: article.translation.content,
                locale: article.translation.locale,
                visibility: 'PUBLIC',
                lastUpdated: article.updated_datetime,
                templateKey: null,
            }

            const result = mapArticleApiToGuidanceArticle(article)

            expect(result).toEqual(expected)
        })
    })

    describe('mapGuidanceFormFieldsToGuidanceArticle', () => {
        it('should map guidance form fields to create guidance article', () => {
            const formValues = {
                name: 'Sample Title',
                content: 'Sample Content',
                isVisible: true,
            }

            const locale = 'en-US'
            const templateKey = 'templateKey'

            const expected = {
                title: 'Sample Title',
                content: 'Sample Content',
                visibility: 'PUBLIC',
                locale: 'en-US',
                templateKey: 'templateKey',
            }

            const result = mapGuidanceFormFieldsToGuidanceArticle(
                formValues,
                locale,
                templateKey
            )

            expect(result).toEqual(expected)
        })
    })
})
