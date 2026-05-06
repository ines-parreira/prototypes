import { useCallback, useMemo } from 'react'

import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { SkillRecapStep } from './SkillRecapStep'
import { SkillReviewStep } from './SkillReviewStep'
import { SkillWizard } from './SkillWizard'

const STEP_QUERY_PARAM = 'step'

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

    const mockItems = useMemo(
        () => Array.from({ length: 9 }, (_, i) => `Recommendation ${i + 1}`),
        [],
    )

    const draftKnowledge = useCallback(
        (_recommendation: string, index: number) => ({
            sourceId: index + 1,
            sourceSetId: 1,
        }),
        [],
    )

    return (
        <Box width="100%" height="100%">
            <SkillWizard
                items={mockItems}
                renderItem={(recommendation, index) => (
                    <SkillReviewStep
                        recommendation={recommendation}
                        index={index}
                    />
                )}
                renderRecap={() => <SkillRecapStep />}
                draftKnowledge={draftKnowledge}
                initialStep={initialStep}
                onClose={onClose}
                onStepChange={onStepChange}
            />
        </Box>
    )
}
