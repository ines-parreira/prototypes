import { useCallback, useEffect, useMemo, useState } from 'react'

import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useSkillWizard } from 'pages/aiAgent/skills/hooks/useSkillWizard'

import { SkillRecapStep } from './SkillRecapStep'
import { SkillReviewStep } from './SkillReviewStep'
import { SkillWizard } from './SkillWizard'
import {
    mockSkillWizardNotStarted,
    SkillWizardStatus,
} from './skillWizard.mock'
import { SkillWizardIntro } from './SkillWizardIntro'

const STEP_QUERY_PARAM = 'step'
const INTRO_DURATION_MS = 2000

const parseStep = (search: string): number | undefined => {
    const raw = new URLSearchParams(search).get(STEP_QUERY_PARAM)
    if (!raw) return undefined
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export const SkillWizardPage = () => {
    const history = useHistory()
    const location = useLocation()
    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const { wizard } = useSkillWizard(mockSkillWizardNotStarted)
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

    const initialStep = useMemo(
        () => parseStep(location.search),
        [location.search],
    )

    const onClose = useCallback(() => {
        history.push(routes.skills)
    }, [history, routes.skills])

    const onStepChange = useCallback(
        (step: number) => {
            const params = new URLSearchParams(history.location.search)
            params.set(STEP_QUERY_PARAM, String(step))
            history.replace({ search: params.toString() })
        },
        [history],
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
                    <SkillReviewStep key={index} skill={skill} />
                )}
                renderRecap={() => <SkillRecapStep wizard={wizard} />}
                draftKnowledge={draftKnowledge}
                initialStep={initialStep}
                onClose={onClose}
                onStepChange={onStepChange}
            />
        </Box>
    )
}
