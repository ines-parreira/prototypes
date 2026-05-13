import { useCallback, useEffect, useMemo, useState } from 'react'

import { Redirect, useHistory, useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'

import { useGetWizard } from 'models/helpCenter/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { useEnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { useSkillWizardMutations } from 'pages/aiAgent/skills/hooks/useSkillWizardMutations'
import {
    SkillWizardSkillStatus,
    SkillWizardStatus,
    SkillWizardStep,
} from 'pages/aiAgent/skills/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { SkillRecapStep } from './SkillRecapStep'
import { SkillReviewStep } from './SkillReviewStep'
import {
    hasActionRequiringSetup,
    isInstructionsEmpty,
} from './skillReviewValidation.utils'
import { SkillWizard } from './SkillWizard'
import { SkillWizardIntro } from './SkillWizardIntro'

const STEP_QUERY_PARAM = 'step'
const INTRO_DURATION_MS = 2000

type SkillWizardPageContentProps = {
    wizard: EnrichedSkillWizard
    helpCenterId: number
    guidanceActions: GuidanceAction[]
    onCloseRoute: string
}

const SkillWizardPageContent = ({
    wizard,
    helpCenterId,
    guidanceActions,
    onCloseRoute,
}: SkillWizardPageContentProps) => {
    const history = useHistory()

    const mutations = useSkillWizardMutations(helpCenterId)

    const reviewableSkills = wizard.reviewable_skills
    const reviewableCount = reviewableSkills.length
    const totalCount = wizard.all_skills.length

    const shouldShowIntro =
        wizard.status === SkillWizardStatus.NotStarted && reviewableCount > 0
    const [isIntroVisible, setIsIntroVisible] = useState(shouldShowIntro)

    useEffect(() => {
        if (!isIntroVisible) return
        const timeoutId = window.setTimeout(
            () => setIsIntroVisible(false),
            INTRO_DURATION_MS,
        )
        return () => window.clearTimeout(timeoutId)
    }, [isIntroVisible])

    const initialStep = wizard.ui_wizard_state.current_step

    useEffect(() => {
        if (wizard.status === SkillWizardStatus.NotStarted) {
            mutations.start()
        }
        // Depending on `mutations` (the whole object) re-fires the effect on
        // every render because the hook returns a fresh object reference each
        // time, causing duplicate `start` PATCHes before `wizard.status` flips.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wizard.status, mutations.start])

    const computeStepLocation = useCallback(
        (step: number) => {
            const isRecap = step > reviewableSkills.length
            if (isRecap) {
                return { current_step: SkillWizardStep.Recap }
            }
            const skill = reviewableSkills[step - 1]
            return {
                current_step: SkillWizardStep.Review,
                current_skill_id: skill?.skill_id,
            }
        },
        [reviewableSkills],
    )

    const skillsConfiguration = useMemo(
        () => wizard.state.skills_configuration ?? [],
        [wizard.state.skills_configuration],
    )
    const savedStatusFor = (
        skillId: number,
    ): SkillWizardSkillStatus | undefined =>
        skillsConfiguration.find((c) => c.id === skillId)?.status

    const onClose = useCallback(() => {
        history.push(onCloseRoute)
    }, [history, onCloseRoute])

    const onStepChange = useCallback(
        (step: number) => {
            const params = new URLSearchParams(history.location.search)
            params.set(STEP_QUERY_PARAM, String(step))
            history.replace({ search: params.toString() })
            mutations.setStepLocation(computeStepLocation(step))
        },
        [history, mutations, computeStepLocation],
    )

    const draftKnowledge = useCallback(
        (skill: (typeof reviewableSkills)[number]) => ({
            sourceId: skill.article?.id ?? skill.skill_id,
            sourceSetId: 1,
        }),
        [],
    )

    if (isIntroVisible) {
        return (
            <Box width="100%" height="100%">
                <SkillWizardIntro
                    reviewableCount={reviewableCount}
                    totalCount={totalCount}
                />
            </Box>
        )
    }

    return (
        <Box width="100%" height="100%">
            <SkillWizard
                items={reviewableSkills}
                renderItem={(skill, index) => (
                    <SkillReviewStep
                        key={index}
                        skill={skill}
                        status={
                            savedStatusFor(skill.skill_id) ??
                            SkillWizardSkillStatus.Approved
                        }
                        onStatusChange={(status) =>
                            mutations.setSkillStatus({
                                skillId: skill.skill_id,
                                status,
                            })
                        }
                        onInstructionsChange={(content) => {
                            if (!skill.article) return
                            const willBeBlocked =
                                isInstructionsEmpty(content) ||
                                hasActionRequiringSetup(
                                    content,
                                    guidanceActions,
                                )
                            const savedStatus = savedStatusFor(skill.skill_id)
                            const draftSkillIdAfterSave =
                                willBeBlocked &&
                                savedStatus !== SkillWizardSkillStatus.Draft
                                    ? skill.skill_id
                                    : undefined
                            mutations.saveInstructions({
                                articleId: skill.article.id,
                                locale: skill.article.translation.locale,
                                content,
                                draftSkillIdAfterSave,
                            })
                        }}
                    />
                )}
                renderRecap={() => <SkillRecapStep wizard={wizard} />}
                draftKnowledge={draftKnowledge}
                initialStep={initialStep}
                isSaving={mutations.isSaving}
                onClose={onClose}
                onStepChange={onStepChange}
            />
        </Box>
    )
}

export const SkillWizardPage = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId ?? 0

    const { data: wizardData, isLoading: isWizardLoading } = useGetWizard(
        helpCenterId,
        { enabled: !!helpCenterId },
    )

    const {
        wizard: enrichedWizard,
        guidanceActions,
        isLoading: isEnrichmentLoading,
    } = useEnrichedSkillWizard(wizardData)

    if (isWizardLoading || isEnrichmentLoading) {
        return <Box width="100%" height="100%" />
    }

    if (!enrichedWizard) {
        return <Redirect to={routes.skills} />
    }

    return (
        <SkillWizardPageContent
            wizard={enrichedWizard}
            helpCenterId={helpCenterId}
            guidanceActions={guidanceActions}
            onCloseRoute={routes.skills}
        />
    )
}
