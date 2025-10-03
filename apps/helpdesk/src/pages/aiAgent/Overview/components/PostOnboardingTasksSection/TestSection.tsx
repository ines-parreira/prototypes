import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { Button, Heading, IconButton, Text, Tooltip } from '@gorgias/axiom'

import { StepConfiguration } from 'models/aiAgentPostStoreInstallationSteps/types'
import {
    MESSAGE_SENT_AI_AGENT_PLAYGROUND_EVENT,
    REFRESH_AI_AGENT_PLAYGROUND_EVENT,
} from 'pages/aiAgent/constants'
import { AiAgentPlaygroundView } from 'pages/aiAgent/Playground/AiAgentPlaygroundView'
import { Drawer } from 'pages/common/components/Drawer/Drawer'

import { PostOnboardingStepMetadata } from './types'

import css from './TestSection.less'

type Props = {
    stepMetadata: PostOnboardingStepMetadata
    step: StepConfiguration
    updateStep: (step: StepConfiguration) => void
}

export const TestSection = ({ stepMetadata, step, updateStep }: Props) => {
    const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false)
    const [isStepCompleted, setIsStepCompleted] = useState(false)
    const { shopName } = useParams<{ shopName: string }>()

    const handleOpenPlayground = () => {
        if (!step.stepStartedDatetime) {
            updateStep({
                ...step,
                stepStartedDatetime: new Date().toISOString(),
            })
        }

        setIsPlaygroundOpen(true)
    }

    const handleClosePlayground = () => {
        setIsPlaygroundOpen(false)
        document.dispatchEvent(
            new CustomEvent(REFRESH_AI_AGENT_PLAYGROUND_EVENT),
        )

        if (!step.stepCompletedDatetime && isStepCompleted) {
            updateStep({
                ...step,
                stepCompletedDatetime: new Date().toISOString(),
            })
        }
    }

    const handleRefresh = () => {
        document.dispatchEvent(
            new CustomEvent(REFRESH_AI_AGENT_PLAYGROUND_EVENT),
        )
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
                    {shopName && (
                        <AiAgentPlaygroundView
                            shopName={shopName}
                            arePlaygroundActionsAllowed={false}
                        />
                    )}
                </Drawer.Content>
            </Drawer>
        </div>
    )
}
