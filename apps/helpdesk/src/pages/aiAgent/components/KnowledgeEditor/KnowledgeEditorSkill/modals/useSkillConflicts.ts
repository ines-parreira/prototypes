import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { isGorgiasApiError } from 'models/api/types'
import { helpCenterKeys } from 'models/helpCenter/queries'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useSkillEditorStore } from '../context'
import type { ConflictingSkill } from '../hooks/useSkillIntentConflicts'
import { useSkillIntentConflicts } from '../hooks/useSkillIntentConflicts'

export type ConflictBannerType = 'none' | 'skills-disabled' | 'intents-affected'

export type SkillDisableInfo = {
    id: number
    title: string
    url: string
}

export const useSkillConflicts = () => {
    const { shopName, helpCenterId, helpCenterLocale } = useSkillEditorStore(
        useShallow((storeState) => ({
            shopName: storeState.config.shopName,
            helpCenterId: storeState.config.helpCenter.id ?? 0,
            helpCenterLocale:
                storeState.config.helpCenter.default_locale ?? 'en-US',
        })),
    )

    const draftIntents = useSkillEditorStore(
        (storeState) => storeState.state.intents,
    )

    const queryClient = useQueryClient()

    const {
        updateGuidanceArticle,
        rebasePublishGuidanceArticle,
        getGuidanceArticleTranslation,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })

    const {
        conflictsBySkill,
        affectedArticleIds,
        hasConflicts,
        publishedIntentIds,
    } = useSkillIntentConflicts()

    const { skillsToDisable, skillsToUpdate, bannerType } = useMemo(() => {
        const toDisable: ConflictingSkill[] = []
        const toUpdate: ConflictingSkill[] = []

        for (const skill of conflictsBySkill) {
            if (skill.totalIntents - skill.conflictingIntents.length <= 0) {
                toDisable.push(skill)
            } else {
                toUpdate.push(skill)
            }
        }

        const hasRemovedIntents =
            publishedIntentIds.size > 0 &&
            [...publishedIntentIds].some(
                (intent) => !draftIntents.includes(intent),
            )

        let banner: ConflictBannerType = 'none'
        if (toDisable.length > 0) {
            banner = 'skills-disabled'
        } else if (toUpdate.length > 0 || hasRemovedIntents) {
            banner = 'intents-affected'
        }

        return {
            skillsToDisable: toDisable,
            skillsToUpdate: toUpdate,
            bannerType: banner,
        }
    }, [conflictsBySkill, publishedIntentIds, draftIntents])

    const skillsToDisableInfo = useMemo<SkillDisableInfo[]>(() => {
        if (skillsToDisable.length === 0) return []

        const routes = getAiAgentNavigationRoutes(shopName)
        return skillsToDisable.map((s) => ({
            id: s.articleId,
            title: s.title,
            url: routes.skillDetail(s.articleId),
        }))
    }, [skillsToDisable, shopName])

    const resolveConflictingSkill = useCallback(
        async (skill: ConflictingSkill, shouldDisable: boolean) => {
            const translation = await getGuidanceArticleTranslation({
                articleId: skill.articleId,
                locale: helpCenterLocale,
            })
            if (!translation) return

            const intentsToKeep = translation.intents.filter(
                (intent) => !skill.conflictingIntents.includes(intent),
            )

            try {
                await rebasePublishGuidanceArticle(
                    { intents: intentsToKeep },
                    {
                        articleId: skill.articleId,
                        locale: translation.locale,
                    },
                )
            } catch (error) {
                const isRebaseError =
                    isGorgiasApiError(error) &&
                    typeof error.response?.data?.error?.msg === 'string' &&
                    error.response.data.error.msg
                        .toLowerCase()
                        .includes('cannot rebase draft')

                if (!isRebaseError) throw error

                await updateGuidanceArticle(
                    { intents: intentsToKeep, isCurrent: true },
                    {
                        articleId: skill.articleId,
                        locale: translation.locale,
                    },
                )
            }

            if (shouldDisable) {
                await updateGuidanceArticle(
                    {
                        visibility: VisibilityStatusEnum.UNLISTED,
                        isCurrent: false,
                    },
                    {
                        articleId: skill.articleId,
                        locale: helpCenterLocale,
                    },
                )
            }
        },
        [
            helpCenterLocale,
            getGuidanceArticleTranslation,
            rebasePublishGuidanceArticle,
            updateGuidanceArticle,
        ],
    )

    const resolveAllConflicts = useCallback(async () => {
        for (const skill of skillsToDisable) {
            await resolveConflictingSkill(skill, true)
        }
        for (const skill of skillsToUpdate) {
            await resolveConflictingSkill(skill, false)
        }
    }, [skillsToDisable, skillsToUpdate, resolveConflictingSkill])

    const invalidateAffectedCaches = useCallback(() => {
        for (const articleId of affectedArticleIds) {
            queryClient.removeQueries(
                helpCenterKeys.article(helpCenterId, articleId),
            )
        }
        queryClient.invalidateQueries(helpCenterKeys.detail(helpCenterId))
    }, [affectedArticleIds, helpCenterId, queryClient])

    return {
        hasConflicts,
        bannerType,
        skillsToDisableInfo,
        resolveAllConflicts,
        invalidateAffectedCaches,
    }
}
