import { useMemo } from 'react'

import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type {
    GaiaRecommendation,
    SkillWizardData,
} from 'pages/aiAgent/skills/types'
import { SkillWizardStep } from 'pages/aiAgent/skills/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'
import type { Components } from 'rest_api/help_center_api/client.generated'

type ArticleListDataDto = Components.Schemas.ArticleListDataDto

/**
 * A GAIA-recommended skill enriched with its full article payload (when the
 * skill exists in the account) plus the recommendation metadata from the
 * wizard's gaia_payload.
 *
 * Suggested alternative names: `RecommendedSkill`, `EnrichedSkill`,
 * `WizardRecommendation`.
 */
export type WizardSkill = {
    skill_id: number
    article: ArticleListDataDto | null
    guidance_ids: number[]
    recommendation: string
    estimated_automation_rate_impact: string
    action_configuration_ids: string[]
}

export type UiWizardState = {
    total_count: number
    current_step: number
}

export type EnrichedSkillWizard = SkillWizardData & {
    /**
     * Every skill referenced by the wizard's gaia_payload, enriched with the
     * matching article from the list-skills endpoint (or null if the skill is
     * not present in the account).
     */
    all_skills: WizardSkill[]
    /**
     * Subset of all_skills that the merchant can actually review/use:
     *  - article exists in the account
     *  - none of the actions used by the article require auth or have missing
     *    values (disabled actions are still considered available)
     *
     */
    reviewable_skills: WizardSkill[]
    ui_wizard_state: UiWizardState
}

const enrichRecommendation = (
    recommendation: GaiaRecommendation,
    article: ArticleListDataDto | null,
): WizardSkill => ({
    skill_id: recommendation.skill_id,
    article,
    guidance_ids: recommendation.guidance_ids,
    recommendation: recommendation.recommendation,
    estimated_automation_rate_impact:
        recommendation.estimated_automation_rate_impact,
    action_configuration_ids: recommendation.action_configuration_ids,
})

const hasBlockingActionSetup = (
    article: ArticleListDataDto,
    availableActions: GuidanceAction[],
): boolean => {
    const content = article.translation?.content ?? ''
    if (!content) return false

    const seen = new Set<string>()
    const regex = new RegExp(
        guidanceActionRegex.source,
        guidanceActionRegex.flags,
    )
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
        const id = match[1]
        if (seen.has(id)) continue
        seen.add(id)

        const action = availableActions.find((a) => a.value === id)
        if (!action) continue
        if (action.requiresAuth || action.hasMissingValues) return true
    }
    return false
}

export const useEnrichedSkillWizard = (
    wizard: SkillWizardData | null | undefined,
) => {
    const { storeConfiguration, isLoading: isLoadingStore } =
        useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId ?? 0
    const shopName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const {
        data: articleList,
        isLoading: isLoadingArticles,
        isError: isErrorArticles,
    } = useGetHelpCenterArticleList(
        helpCenterId,
        {
            origin: 'skill',
            version_status: 'latest_draft',
            per_page: 200,
        },
        { enabled: !!helpCenterId },
    )

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const articleById = useMemo(() => {
        const map = new Map<number, ArticleListDataDto>()
        for (const article of articleList?.data ?? []) {
            map.set(article.id, article)
        }
        return map
    }, [articleList])

    const configuredSkillIds = useMemo(() => {
        const ids = new Set<number>()
        for (const config of wizard?.state.skills_configuration ?? []) {
            ids.add(config.id)
        }
        return ids
    }, [wizard])

    const all_skills = useMemo<WizardSkill[]>(() => {
        if (!wizard) return []
        const recommendations = wizard.gaia_payload.recommendations ?? []
        return recommendations.map((recommendation) =>
            enrichRecommendation(
                recommendation,
                articleById.get(recommendation.skill_id) ?? null,
            ),
        )
    }, [wizard, articleById])

    const reviewable_skills = useMemo<WizardSkill[]>(
        () =>
            all_skills.filter((skill) => {
                if (!skill.article) return false
                if (configuredSkillIds.has(skill.skill_id)) return true
                if (hasBlockingActionSetup(skill.article, guidanceActions))
                    return false
                return true
            }),
        [all_skills, configuredSkillIds, guidanceActions],
    )

    const ui_wizard_state = useMemo<UiWizardState>(() => {
        const total_count = reviewable_skills.length

        if (wizard?.state.current_step === SkillWizardStep.Recap) {
            return {
                total_count,
                current_step: total_count + 1,
            }
        }

        const currentSkillId = wizard?.state.current_skill_id
        const index =
            currentSkillId !== undefined
                ? reviewable_skills.findIndex(
                      (skill) => skill.skill_id === currentSkillId,
                  )
                : -1
        return {
            total_count,
            current_step: index >= 0 ? index + 1 : 1,
        }
    }, [reviewable_skills, wizard])

    const enrichedWizard = useMemo<EnrichedSkillWizard | null>(
        () =>
            wizard
                ? {
                      ...wizard,
                      all_skills,
                      reviewable_skills,
                      ui_wizard_state,
                  }
                : null,
        [wizard, all_skills, reviewable_skills, ui_wizard_state],
    )

    return {
        wizard: enrichedWizard,
        guidanceActions,
        isLoading: isLoadingStore || isLoadingArticles || isLoadingActions,
        isError: isErrorArticles,
    }
}
