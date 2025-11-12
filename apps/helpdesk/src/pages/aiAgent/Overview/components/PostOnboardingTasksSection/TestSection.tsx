import { useEffect, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import {
    LegacyButton as Button,
    Heading,
    LegacyIconButton as IconButton,
    Text,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import {
    PostStoreInstallationStepStatus,
    StepConfiguration,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import {
    MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT,
    REFRESH_AI_AGENT_PLAYGROUND_EVENT,
} from 'pages/aiAgent/constants'
import { AiAgentPlaygroundView } from 'pages/aiAgent/Playground/AiAgentPlaygroundView'
import { AiAgentPlayground } from 'pages/aiAgent/PlaygroundV2/AiAgentPlayground'
import { Drawer } from 'pages/common/components/Drawer/Drawer'

import { PostOnboardingStepMetadata } from './types'

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
    const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false)
    const [isStepCompleted, setIsStepCompleted] = useState(false)
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const [resetPlayground, setResetPlayground] = useState(false)

    const handleOpenPlayground = () => {
        if (!step?.stepStartedDatetime) {
            updateStep({
                ...step,
                stepStartedDatetime: new Date().toISOString(),
            })
        }

        setIsPlaygroundOpen(true)
    }

    const handleClosePlayground = () => {
        setIsPlaygroundOpen(false)
        handleRefresh()

        if (isStepCompleted) {
            logEvent(SegmentEvent.PostOnboardingTaskActionDone, {
                step: stepMetadata.stepName,
                action: 'executed_test',
                shop_name: shopName,
                shop_type: shopType,
            })
        }

        if (!step.stepCompletedDatetime && isStepCompleted) {
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
        }

        setIsStepCompleted(false)
    }

    const handleRefresh = () => {
        document.dispatchEvent(
            new CustomEvent(REFRESH_AI_AGENT_PLAYGROUND_EVENT),
        )
        setResetPlayground(true)
    }

    const onGuidanceClick = (guidanceArticleId: number) => {
        handleClosePlayground()
        onEditGuidanceArticle(guidanceArticleId)
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

    const isNewPlaygroundEnabled = useFlag(
        FeatureFlagKey.MakePlaygroundAvailableEverywhere,
        false,
    )

    return (
        <div className={css.container}>
            <div className={css.leftContent}>
                <Text size="md" variant="regular">
                    {stepMetadata.stepDescription}
                </Text>
                <Button
                    className={css.testButton}
                    onClick={handleOpenPlayground}
                >
                    Test
                </Button>
            </div>

            <div className={css.rightContent}>
                <img
                    src={stepMetadata.stepImage}
                    alt="AI Agent testing"
                    className={css.image}
                />
            </div>

            <Drawer
                open={isPlaygroundOpen}
                fullscreen={false}
                isLoading={false}
                aria-label="AI Agent Test Mode"
                portalRootId="app-root"
                onBackdropClick={handleClosePlayground}
                className={`${css.playgroundDrawer} hide-reset-button`}
                data-testid="playground-drawer"
                withFooter={false}
                showBackdrop={false}
            >
                <Drawer.Header className={css.playgroundDrawerHeader}>
                    <Heading size="sm">Test</Heading>
                    <Drawer.HeaderActions
                        onClose={handleClosePlayground}
                        closeButtonId="close-playground-button"
                        customCloseButtonIcon="close"
                        className={css.playgroundDrawerHeaderActions}
                        customTooltipText="Close test"
                    >
                        <IconButton
                            id="refresh-playground-button"
                            icon="refresh"
                            onClick={handleRefresh}
                            fillStyle="ghost"
                            intent="secondary"
                            aria-label="refresh playground"
                        />

                        <Tooltip
                            placement="bottom-end"
                            target="refresh-playground-button"
                        >
                            Reset test
                        </Tooltip>
                    </Drawer.HeaderActions>
                </Drawer.Header>
                <Drawer.Content>
                    {isNewPlaygroundEnabled ? (
                        <AiAgentPlayground
                            arePlaygroundActionsAllowed={false}
                            resetPlayground={resetPlayground}
                            resetPlaygroundCallback={() =>
                                setResetPlayground(false)
                            }
                            withResetButton={false}
                            onGuidanceClick={onGuidanceClick}
                        />
                    ) : (
                        shopName && (
                            <AiAgentPlaygroundView
                                shopName={shopName}
                                onGuidanceClick={onGuidanceClick}
                            />
                        )
                    )}
                </Drawer.Content>
            </Drawer>
        </div>
    )
}
