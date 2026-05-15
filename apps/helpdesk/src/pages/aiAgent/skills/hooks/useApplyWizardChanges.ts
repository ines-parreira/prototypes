import { useCallback, useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import type { LocaleCode } from 'models/helpCenter/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import {
    getGuidanceIdsToDisable,
    getSkillToggleStates,
} from 'pages/aiAgent/skills/components/SkillWizard/skillRecap.utils'
import { useEnableAction } from 'pages/aiAgent/skills/hooks/useEnableAction'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import type { Paths as WorkflowsPaths } from 'rest_api/workflows_api/client.generated'

type StoreConfiguration =
    WorkflowsPaths.StoreWfConfigurationControllerList.Responses.$200[number]
type StoreType =
    WorkflowsPaths.StoreWfConfigurationControllerUpsert.Parameters.StoreType

export type ApplyPhase =
    | 'idle'
    | 'enabling-skills'
    | 'disabling-guidances'
    | 'success'
    | 'error'

export type UseApplyWizardChangesArgs = {
    wizard: EnrichedSkillWizard
    skillOverrides: ReadonlyMap<number, boolean>
    guidanceOverrides: ReadonlyMap<number, boolean>
    guidanceActions: GuidanceAction[]
    rawActions: StoreConfiguration[]
    helpCenterId: number
    storeName: string
    storeType: StoreType
    localeCode: LocaleCode | undefined
}

export type UseApplyWizardChangesResult = {
    apply: () => void
    phase: ApplyPhase
    liveSkillsCount: number
}

export const useApplyWizardChanges = ({
    wizard,
    skillOverrides,
    guidanceOverrides,
    guidanceActions,
    rawActions,
    helpCenterId,
    storeName,
    storeType,
    localeCode,
}: UseApplyWizardChangesArgs): UseApplyWizardChangesResult => {
    const [phase, setPhase] = useState<ApplyPhase>('idle')
    const [liveSkillsCount, setLiveSkillsCount] = useState(0)

    const enableAction = useEnableAction()
    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: helpCenterId,
    })

    const { mutate: applyMutate } = useMutation({
        mutationFn: async () => {
            if (!localeCode) {
                throw new Error('Help center locale not loaded')
            }

            setPhase('enabling-skills')

            const enabledSkillStates = getSkillToggleStates(
                wizard,
                skillOverrides,
                guidanceActions,
            ).filter((state) => state.isEnabled)

            const rawActionById = new Map(
                rawActions.map((action) => [action.id, action]),
            )

            const skillEnableResults = await Promise.allSettled(
                enabledSkillStates.map(async (state) => {
                    if (state.disabledActionIds.length > 0) {
                        await Promise.all(
                            state.disabledActionIds.map((actionId) => {
                                const configuration =
                                    rawActionById.get(actionId)
                                if (!configuration) {
                                    throw new Error(
                                        `Workflow configuration ${actionId} not found in cache`,
                                    )
                                }
                                return enableAction({
                                    storeName,
                                    storeType,
                                    configuration,
                                })
                            }),
                        )
                    }
                    const articleId = state.skill.article?.id
                    if (articleId === undefined) {
                        throw new Error(
                            `Skill ${state.skill.skill_id} has no article id`,
                        )
                    }
                    await updateGuidanceArticle(
                        {
                            isCurrent: true,
                            visibility: VisibilityStatusEnum.PUBLIC,
                        },
                        { articleId, locale: localeCode },
                    )
                    return { skillId: state.skill.skill_id, articleId }
                }),
            )

            const publishedCount = skillEnableResults.filter(
                (result) => result.status === 'fulfilled',
            ).length

            if (publishedCount === 0) {
                throw new Error('No skills could be enabled')
            }

            setLiveSkillsCount(publishedCount)

            setPhase('disabling-guidances')

            const guidanceIdsToDisable = getGuidanceIdsToDisable(
                wizard,
                skillOverrides,
                guidanceOverrides,
            )

            await Promise.allSettled(
                guidanceIdsToDisable.map((articleId) =>
                    updateGuidanceArticle(
                        {
                            isCurrent: false,
                            visibility: VisibilityStatusEnum.UNLISTED,
                        },
                        { articleId, locale: localeCode },
                    ),
                ),
            )

            setPhase('success')
        },
        onError: () => {
            setPhase('error')
        },
    })

    const apply = useCallback(() => applyMutate(), [applyMutate])

    return { apply, phase, liveSkillsCount }
}
