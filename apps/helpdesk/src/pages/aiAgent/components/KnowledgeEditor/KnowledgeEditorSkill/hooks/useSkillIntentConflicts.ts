import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useListIntents } from 'models/helpCenter/queries'
import type { Components } from 'rest_api/help_center_api/client.generated'

import { useSkillEditorStore } from '../context'

export type ConflictingSkill = {
    articleId: number
    title: string
    conflictingIntents: string[]
    totalIntents: number
}

type ConflictDetectionResult = {
    conflictingIntentIds: Set<string>
    conflictsBySkill: ConflictingSkill[]
    affectedArticleIds: number[]
    hasConflicts: boolean
    publishedIntentIds: Set<string>
}

const EMPTY_RESULT: ConflictDetectionResult = {
    conflictingIntentIds: new Set(),
    conflictsBySkill: [],
    affectedArticleIds: [],
    hasConflicts: false,
    publishedIntentIds: new Set(),
}

export function detectIntentConflicts(
    intents: Components.Schemas.IntentResponseDto[],
    skillId: number,
    draftIntents: Set<string>,
): ConflictDetectionResult {
    const linkedIntents = intents.filter((i) => i.status === 'linked')

    const articleIntentCount = new Map<number, number>()
    for (const intent of linkedIntents) {
        for (const article of intent.articles) {
            if (
                article.status === 'published' &&
                article.visibility_status === 'PUBLIC'
            ) {
                articleIntentCount.set(
                    article.id,
                    (articleIntentCount.get(article.id) ?? 0) + 1,
                )
            }
        }
    }

    // Intents currently published by the current skill
    const publishedIntentIds = new Set<string>()
    for (const intent of intents) {
        if (
            intent.articles.some(
                (a) => a.id === skillId && a.status === 'published',
            )
        ) {
            publishedIntentIds.add(intent.name)
        }
    }

    const conflictingIntentIds = new Set<string>()
    const conflictMap = new Map<number, ConflictingSkill>()

    for (const intent of linkedIntents) {
        if (!draftIntents.has(intent.name)) continue

        const ownerArticle = intent.articles.find(
            (a) =>
                a.status === 'published' &&
                a.visibility_status === 'PUBLIC' &&
                a.id !== skillId,
        )
        if (!ownerArticle) continue

        conflictingIntentIds.add(intent.name)

        const existing = conflictMap.get(ownerArticle.id)
        if (existing) {
            existing.conflictingIntents.push(intent.name)
        } else {
            conflictMap.set(ownerArticle.id, {
                articleId: ownerArticle.id,
                title: ownerArticle.title,
                conflictingIntents: [intent.name],
                totalIntents: articleIntentCount.get(ownerArticle.id) ?? 0,
            })
        }
    }

    const conflictsBySkill = [...conflictMap.values()]

    return {
        conflictingIntentIds,
        conflictsBySkill,
        affectedArticleIds: [...conflictMap.keys()],
        hasConflicts: conflictsBySkill.length > 0,
        publishedIntentIds,
    }
}

export const useSkillIntentConflicts = (): ConflictDetectionResult => {
    const { skillId, draftIntents, helpCenterId } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            draftIntents: storeState.state.intents,
            helpCenterId: storeState.config.helpCenter.id,
        })),
    )

    const { data: listIntentsData } = useListIntents(helpCenterId, {
        enabled: !!skillId,
    })

    return useMemo(() => {
        if (!listIntentsData?.intents || !skillId) return EMPTY_RESULT

        return detectIntentConflicts(
            listIntentsData.intents,
            skillId,
            new Set(draftIntents),
        )
    }, [listIntentsData?.intents, skillId, draftIntents])
}
