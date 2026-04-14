import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useListIntents } from 'models/helpCenter/queries'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'

export const useIntentConflicts = () => {
    const { skillArticleId, helpCenterId } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillArticleId: storeState.state.skill?.id,
            helpCenterId: storeState.config.helpCenter.id,
        })),
    )

    const isExistingSkill = skillArticleId != null

    const { data: listIntentsData } = useListIntents(helpCenterId, {
        enabled: isExistingSkill,
    })

    const conflictingIntentIds = useMemo<Set<string>>(() => {
        const conflicts = new Set<string>()
        if (!listIntentsData?.intents || !isExistingSkill) return conflicts

        for (const intent of listIntentsData.intents) {
            const publishedArticleEntry = intent.articles.find(
                (a) => a.status === 'published',
            )
            if (
                publishedArticleEntry &&
                publishedArticleEntry.id !== skillArticleId
            ) {
                conflicts.add(intent.name)
            }
        }
        return conflicts
    }, [listIntentsData?.intents, skillArticleId, isExistingSkill])

    return conflictingIntentIds
}
