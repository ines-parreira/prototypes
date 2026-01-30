import { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type { FilteredKnowledgeHubArticle } from '../types'
import { getVersionStatus, hasDraftEdits, isDraft } from './articleUtils'

describe('articleUtils', () => {
    describe('isDraft', () => {
        it('should return false when article is undefined', () => {
            const result = isDraft(undefined)

            expect(result).toBe(false)
        })

        it('should return true when article has no publishedVersionId', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = isDraft(article)

            expect(result).toBe(true)
        })

        it('should return true when article has only publishedVersionId undefined', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 2,
                publishedVersionId: undefined,
                visibility: 'PUBLIC',
            }

            const result = isDraft(article)

            expect(result).toBe(true)
        })

        it('should return false when draftVersionId equals publishedVersionId', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 1,
                publishedVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = isDraft(article)

            expect(result).toBe(false)
        })

        it('should return true when draftVersionId differs from publishedVersionId', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 2,
                publishedVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = isDraft(article)

            expect(result).toBe(true)
        })

        it('should return true when draftVersionId is greater than publishedVersionId', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 5,
                publishedVersionId: 3,
                visibility: 'PUBLIC',
            }

            const result = isDraft(article)

            expect(result).toBe(true)
        })
    })

    describe('getVersionStatus', () => {
        it('should return Current when article is undefined', () => {
            const result = getVersionStatus(undefined)

            expect(result).toBe(GetArticleVersionStatus.Current)
        })

        it('should return LatestDraft when article has never been published', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = getVersionStatus(article)

            expect(result).toBe(GetArticleVersionStatus.LatestDraft)
        })

        it('should return Current when article is published with no draft changes', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 1,
                publishedVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = getVersionStatus(article)

            expect(result).toBe(GetArticleVersionStatus.Current)
        })

        it('should return LatestDraft when article has unpublished draft changes', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 2,
                publishedVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = getVersionStatus(article)

            expect(result).toBe(GetArticleVersionStatus.LatestDraft)
        })

        it('should return LatestDraft when draft version is significantly ahead', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 10,
                publishedVersionId: 5,
                visibility: 'PUBLIC',
            }

            const result = getVersionStatus(article)

            expect(result).toBe(GetArticleVersionStatus.LatestDraft)
        })

        it('should return LatestDraft when article has only draftVersionId', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                draftVersionId: 1,
                publishedVersionId: undefined,
                visibility: 'PUBLIC',
            }

            const result = getVersionStatus(article)

            expect(result).toBe(GetArticleVersionStatus.LatestDraft)
        })
    })

    describe('hasDraftEdits', () => {
        it('should return true when article is published with draft changes', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                publishedVersionId: 1,
                draftVersionId: 2,
                visibility: 'PUBLIC',
            }

            const result = hasDraftEdits(article)

            expect(result).toBe(true)
        })

        it('should return false when article was never published', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                publishedVersionId: null,
                draftVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = hasDraftEdits(article)

            expect(result).toBe(false)
        })

        it('should return false when publishedVersionId is undefined', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                publishedVersionId: undefined,
                draftVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = hasDraftEdits(article)

            expect(result).toBe(false)
        })

        it('should return false when draft and published versions are the same', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                publishedVersionId: 1,
                draftVersionId: 1,
                visibility: 'PUBLIC',
            }

            const result = hasDraftEdits(article)

            expect(result).toBe(false)
        })

        it('should return false when article is undefined', () => {
            const result = hasDraftEdits(undefined)

            expect(result).toBe(false)
        })

        it('should return true when draft version is significantly ahead of published', () => {
            const article: FilteredKnowledgeHubArticle = {
                id: 123,
                title: '',
                publishedVersionId: 5,
                draftVersionId: 10,
                visibility: 'PUBLIC',
            }

            const result = hasDraftEdits(article)

            expect(result).toBe(true)
        })
    })
})
