import { useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { SegmentEvent } from '@repo/logging'

import { Card } from '@gorgias/axiom'

import type { GorgiasChatCreationWizardSteps } from 'models/integration/types/gorgiasChat'
import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'
import { StepperProgressHeader } from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatCreationWizard/revamp/components/StepperProgressHeader'

import useLogWizardEvent from '../hooks/useLogWizardEvent'
import { STEP_DESCRIPTIONS, STEP_LABELS } from './constants'

import css from './GorgiasChatCreationWizardStep.less'

type Props = {
    step: GorgiasChatCreationWizardSteps
    children: React.ReactNode
    preview: React.ReactNode
    showPreviewPlaceholder?: boolean
    footer: React.ReactNode
}

export const GorgiasChatCreationWizardStep = ({
    step,
    children,
    preview,
    showPreviewPlaceholder,
    footer,
}: Props) => {
    const logWizardEvent = useLogWizardEvent()

    const contentRef = useRef<HTMLDivElement>(null)
    const contentIsIntersecting =
        useIsIntersectingWithBrowserViewport(contentRef)

    useEffectOnce(() => {
        logWizardEvent(SegmentEvent.ChatWidgetWizardStepStarted)
    })

    return (
        <>
            <div className={css.wizard}>
                <div className={css.content} ref={contentRef}>
                    <StepperProgressHeader
                        labels={STEP_LABELS}
                        className={css.wizardProgressHeader}
                    />
                    <Card p="lg" gap={0}>
                        <div className={css.heading}>
                            <div className={css.title}>{STEP_LABELS[step]}</div>
                            {STEP_DESCRIPTIONS[step] && (
                                <div className={css.description}>
                                    {STEP_DESCRIPTIONS[step]}
                                </div>
                            )}
                        </div>
                        {children}
                    </Card>
                    <div className={css.footer}>
                        {!contentIsIntersecting && (
                            <div className={css.footerShadow} />
                        )}
                        <div className={css.footerContent}>{footer}</div>
                    </div>
                </div>
            </div>
            <div className={css.preview}>
                {showPreviewPlaceholder ? (
                    <div className={css.previewPlaceholder}>
                        Connect a store to use AI Agent features in Chat
                    </div>
                ) : (
                    <div className={css.previewCenter}>{preview}</div>
                )}
            </div>
        </>
    )
}
