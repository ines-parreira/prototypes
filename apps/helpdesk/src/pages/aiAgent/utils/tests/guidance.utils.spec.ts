import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { NotificationStatus } from 'state/notifications/types'

import { getGuidanceArticleFixture } from '../../fixtures/guidanceArticle.fixture'
import type { UpdateGuidanceArticle } from '../../types'
import {
    handleGuidanceDuplicateError,
    mapArticleApiToGuidanceArticle,
    mapGuidanceFormFieldsToGuidanceArticle,
    mapGuidanceToArticleApi,
    mapUpdateGuidanceArticleToArticleApi,
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
                updateGuidanceArticle,
            )

            expect(result).toEqual(expected)
        })

        it('should map linked intents when updating guidance article', () => {
            const updateGuidanceArticle: UpdateGuidanceArticle = {
                intents: ['order::status'],
            }

            const result = mapUpdateGuidanceArticleToArticleApi(
                updateGuidanceArticle,
            )

            expect(result).toEqual({
                intents: ['order::status'],
            })
        })

        it('should omit intents when they are undefined', () => {
            const updateGuidanceArticle: UpdateGuidanceArticle = {
                title: 'Updated Title',
            }

            const result = mapUpdateGuidanceArticleToArticleApi(
                updateGuidanceArticle,
            )

            expect(result).toEqual({
                title: 'Updated Title',
                content: undefined,
                visibility_status: undefined,
                slug: 'updated-title',
                is_current: undefined,
                commit_message: undefined,
            })
        })

        it('should omit intents when they are null', () => {
            const updateGuidanceArticle = {
                intents: null,
            } as unknown as UpdateGuidanceArticle

            const result = mapUpdateGuidanceArticleToArticleApi(
                updateGuidanceArticle,
            )

            expect(result).toEqual({
                title: undefined,
                content: undefined,
                visibility_status: undefined,
                slug: undefined,
                is_current: undefined,
                commit_message: undefined,
            })
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
                createdDatetime: article.created_datetime,
                lastUpdated: article.translation.updated_datetime,
                templateKey: null,
                isCurrent: article.translation.is_current,
                draftVersionId: article.translation.draft_version_id,
                publishedVersionId: article.translation.published_version_id,
                intents: article.translation.intents,
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
                templateKey,
            )

            expect(result).toEqual(expected)
        })
    })

    describe('handleGuidanceDuplicateError', () => {
        it('should handle duplicate title error correctly', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'An article with the title "Test Title" already exists in this help center',
                        },
                    },
                },
            }

            const result = handleGuidanceDuplicateError(error, 'Test Title')

            expect(result).toEqual({
                isDuplicate: true,
                type: 'title',
                notification: {
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with the name "Test Title" already exists in this help center',
                },
            })
        })

        it('should handle duplicate content error correctly', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'An article with identical content already exists in this help center',
                        },
                    },
                },
            }

            const result = handleGuidanceDuplicateError(error, 'Some Title')

            expect(result).toEqual({
                isDuplicate: true,
                type: 'content',
                notification: {
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with identical instructions already exists in this help center',
                },
            })
        })

        it('should return not duplicate for other errors', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'Some other error message',
                        },
                    },
                },
            }

            const result = handleGuidanceDuplicateError(error, 'Test Title')

            expect(result).toEqual({
                isDuplicate: false,
            })
        })

        it('should return not duplicate when no error message is present', () => {
            const error = {
                response: {
                    data: {},
                },
            }

            const result = handleGuidanceDuplicateError(error, 'Test Title')

            expect(result).toEqual({
                isDuplicate: false,
            })
        })

        it('should return not duplicate for malformed error object', () => {
            const error = {}

            const result = handleGuidanceDuplicateError(error, 'Test Title')

            expect(result).toEqual({
                isDuplicate: false,
            })
        })

        it('should return not duplicate for null/undefined error', () => {
            const result1 = handleGuidanceDuplicateError(null, 'Test Title')
            const result2 = handleGuidanceDuplicateError(
                undefined,
                'Test Title',
            )

            expect(result1).toEqual({ isDuplicate: false })
            expect(result2).toEqual({ isDuplicate: false })
        })

        it('should use provided guidance name in title error message', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'An article with the title "Different Title" already exists in this help center',
                        },
                    },
                },
            }

            const result = handleGuidanceDuplicateError(error, 'My Custom Name')

            expect(result).toEqual({
                isDuplicate: true,
                type: 'title',
                notification: {
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with the name "My Custom Name" already exists in this help center',
                },
            })
        })

        it('should return is duplicate when error is empty', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'already exists',
                        },
                    },
                },
            }

            const result = handleGuidanceDuplicateError(error, 'Test Title')

            expect(result).toEqual({
                isDuplicate: false,
            })
        })
    })
})
