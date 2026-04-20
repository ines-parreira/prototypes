import type { Components } from 'rest_api/help_center_api/client.generated'

import { detectIntentConflicts } from './useSkillIntentConflicts'

type IntentResponseDto = Components.Schemas.IntentResponseDto
type ArticleInIntentDto = Components.Schemas.ArticleInIntentDto

const makeArticle = (
    overrides: Partial<ArticleInIntentDto> = {},
): ArticleInIntentDto => ({
    id: 1,
    locale: 'en-US',
    article_translation_version_id: 100,
    title: 'Test Article',
    status: 'published',
    template_key: null,
    visibility_status: 'PUBLIC',
    ...overrides,
})

const makeIntent = (
    overrides: Partial<IntentResponseDto> & { name: IntentResponseDto['name'] },
): IntentResponseDto => ({
    status: 'linked',
    help_center_id: 1,
    articles: [],
    ...overrides,
})

describe('detectIntentConflicts', () => {
    it('returns empty result when no intents', () => {
        const result = detectIntentConflicts([], 1, new Set(['order::status']))

        expect(result.hasConflicts).toBe(false)
        expect(result.conflictingIntentIds.size).toBe(0)
        expect(result.conflictsBySkill).toEqual([])
        expect(result.affectedArticleIds).toEqual([])
        expect(result.publishedIntentIds.size).toBe(0)
    })

    it('returns empty result when no draft intents match any linked intent', () => {
        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [makeArticle({ id: 10 })],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            99,
            new Set(['order::cancel']),
        )

        expect(result.hasConflicts).toBe(false)
        expect(result.conflictingIntentIds.size).toBe(0)
    })

    it('detects conflict when another skill has the same intent published and PUBLIC', () => {
        const otherArticle = makeArticle({
            id: 10,
            title: 'Other Skill',
            status: 'published',
            visibility_status: 'PUBLIC',
        })

        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [otherArticle],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            99,
            new Set(['order::status']),
        )

        expect(result.hasConflicts).toBe(true)
        expect(result.conflictingIntentIds.has('order::status')).toBe(true)
        expect(result.conflictsBySkill).toHaveLength(1)
        expect(result.conflictsBySkill[0]).toEqual(
            expect.objectContaining({
                articleId: 10,
                title: 'Other Skill',
                conflictingIntents: ['order::status'],
            }),
        )
        expect(result.affectedArticleIds).toEqual([10])
    })

    it('ignores intents with status not equal to linked', () => {
        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                status: 'not_linked',
                articles: [
                    makeArticle({
                        id: 10,
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
            makeIntent({
                name: 'order::cancel',
                status: 'handover',
                articles: [
                    makeArticle({
                        id: 11,
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            99,
            new Set(['order::status', 'order::cancel']),
        )

        expect(result.hasConflicts).toBe(false)
    })

    it('ignores articles with visibility_status not equal to PUBLIC', () => {
        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [
                    makeArticle({
                        id: 10,
                        status: 'published',
                        visibility_status: 'UNLISTED',
                    }),
                ],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            99,
            new Set(['order::status']),
        )

        expect(result.hasConflicts).toBe(false)
    })

    it('ignores the current skill own articles', () => {
        const currentSkillId = 42

        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [
                    makeArticle({
                        id: currentSkillId,
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            currentSkillId,
            new Set(['order::status']),
        )

        expect(result.hasConflicts).toBe(false)
    })

    it('groups multiple conflicting intents by article', () => {
        const sharedArticleId = 10

        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [
                    makeArticle({
                        id: sharedArticleId,
                        title: 'Shared Skill',
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
            makeIntent({
                name: 'order::cancel',
                articles: [
                    makeArticle({
                        id: sharedArticleId,
                        title: 'Shared Skill',
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            99,
            new Set(['order::status', 'order::cancel']),
        )

        expect(result.hasConflicts).toBe(true)
        expect(result.conflictsBySkill).toHaveLength(1)
        expect(result.conflictsBySkill[0].articleId).toBe(sharedArticleId)
        expect(result.conflictsBySkill[0].conflictingIntents).toEqual([
            'order::status',
            'order::cancel',
        ])
        expect(result.affectedArticleIds).toEqual([sharedArticleId])
    })

    it('returns publishedIntentIds for the current skill', () => {
        const currentSkillId = 42

        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [
                    makeArticle({ id: currentSkillId, status: 'published' }),
                ],
            }),
            makeIntent({
                name: 'order::cancel',
                articles: [
                    makeArticle({ id: currentSkillId, status: 'published' }),
                ],
            }),
            makeIntent({
                name: 'order::refund',
                articles: [makeArticle({ id: 99, status: 'published' })],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            currentSkillId,
            new Set(['order::status', 'order::cancel']),
        )

        expect(result.publishedIntentIds.size).toBe(2)
        expect(result.publishedIntentIds.has('order::status')).toBe(true)
        expect(result.publishedIntentIds.has('order::cancel')).toBe(true)
        expect(result.publishedIntentIds.has('order::refund')).toBe(false)
    })

    it('does not include draft-only articles in publishedIntentIds', () => {
        const currentSkillId = 42

        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [
                    makeArticle({ id: currentSkillId, status: 'draft' }),
                ],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            currentSkillId,
            new Set(['order::status']),
        )

        expect(result.publishedIntentIds.size).toBe(0)
    })

    it('counts totalIntents correctly for affected articles', () => {
        const articleId = 10

        const intents: IntentResponseDto[] = [
            makeIntent({
                name: 'order::status',
                articles: [
                    makeArticle({
                        id: articleId,
                        title: 'Multi-Intent Skill',
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
            makeIntent({
                name: 'order::cancel',
                articles: [
                    makeArticle({
                        id: articleId,
                        title: 'Multi-Intent Skill',
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
            makeIntent({
                name: 'order::refund',
                articles: [
                    makeArticle({
                        id: articleId,
                        title: 'Multi-Intent Skill',
                        status: 'published',
                        visibility_status: 'PUBLIC',
                    }),
                ],
            }),
        ]

        const result = detectIntentConflicts(
            intents,
            99,
            new Set(['order::status']),
        )

        expect(result.hasConflicts).toBe(true)
        expect(result.conflictsBySkill[0].totalIntents).toBe(3)
        expect(result.conflictsBySkill[0].conflictingIntents).toEqual([
            'order::status',
        ])
    })
})
