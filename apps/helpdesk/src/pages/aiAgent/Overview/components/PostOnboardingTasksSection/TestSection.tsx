import { useCallback, useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { Button, Text } from '@gorgias/axiom'

import type { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'
import { PostStoreInstallationStepStatus } from 'models/aiAgentPostStoreInstallationSteps/types'
import { MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT } from 'pages/aiAgent/constants'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'

import type { PostOnboardingStepMetadata } from './types'

import css from './TestSection.less'

type Props = {
    stepMetadata: PostOnboardingStepMetadata
    step: StepConfiguration
    updateStep: (step: StepConfiguration) => void
    onEditGuidanceArticle: (guidanceArticleId: number) => void
}

export const TestSection = ({
    stepMetadata,
    step,
    updateStep,
    onEditGuidanceArticle,
}: Props) => {
    const [isStepCompleted, setIsStepCompleted] = useState(false)
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const handleGuidanceClick = useCallback(
        (guidanceArticleId: number) => {
            onEditGuidanceArticle(guidanceArticleId)
        },
        [onEditGuidanceArticle],
    )

    const { isPlaygroundOpen, openPlayground } = usePlaygroundPanel({
        onGuidanceClick: handleGuidanceClick,
    })

    const handleOpenPlayground = () => {
        if (!step?.stepStartedDatetime) {
            updateStep({
                ...step,
                stepStartedDatetime: new Date().toISOString(),
            })
        }

        openPlayground()
    }

    useEffect(() => {
        const handleMessageSent = () => {
            setIsStepCompleted(true)
        }
        document.addEventListener(
            MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT,
            handleMessageSent,
        )
        return () => {
            document.removeEventListener(
                MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT,
                handleMessageSent,
            )
        }
    }, [])

    useEffect(() => {
        if (
            !isPlaygroundOpen &&
            step?.stepStartedDatetime &&
            !step.stepCompletedDatetime &&
            isStepCompleted
        ) {
            logEvent(SegmentEvent.PostOnboardingTaskActionDone, {
                step: stepMetadata.stepName,
                action: 'executed_test',
                shop_name: shopName,
                shop_type: shopType,
            })

            void updateStep({
                ...step,
                stepCompletedDatetime: new Date().toISOString(),
            })

            logEvent(SegmentEvent.PostOnboardingTaskCompleted, {
                step: stepMetadata.stepName,
                status: PostStoreInstallationStepStatus.COMPLETED,
                shop_name: shopName,
                shop_type: shopType,
            })

            setIsStepCompleted(false)
        }
    }, [
        isPlaygroundOpen,
        step,
        isStepCompleted,
        stepMetadata.stepName,
        shopName,
        shopType,
        updateStep,
    ])

    return (
        <div className={css.container}>
            <div className={css.leftContent}>
                <Text size="md" variant="regular">
                    {stepMetadata.stepDescription}
                </Text>
                {!isPlaygroundOpen && (
                    <Button variant="primary" onClick={handleOpenPlayground}>
                        Test
                    </Button>
                )}
            </div>

            <div className={css.rightContent}>
                <img
                    src={stepMetadata.stepImage}
                    alt="AI Agent testing"
                    className={css.image}
                />
            </div>
        </div>
    )
}
