import { useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { SegmentEvent } from '@repo/logging'

import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'
import { StepperProgressHeader } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatCreationWizard/revamp/components/StepperProgressHeader'

import useLogWizardEvent from '../hooks/useLogWizardEvent'
import { STEP_LABELS } from './constants'

import css from './GorgiasChatCreationWizardStep.less'

type Props = {
    children: React.ReactNode
    footer: React.ReactNode
}

export const GorgiasChatCreationWizardStep = ({ children, footer }: Props) => {
    const logWizardEvent = useLogWizardEvent()

    const contentRef = useRef<HTMLDivElement>(null)
    const contentIsIntersecting =
        useIsIntersectingWithBrowserViewport(contentRef)

    useEffectOnce(() => {
        logWizardEvent(SegmentEvent.ChatWidgetWizardStepStarted)
    })

    return (
        <div className={css.wizard}>
            <div className={css.content} ref={contentRef}>
                <StepperProgressHeader
                    labels={STEP_LABELS}
                    className={css.wizardProgressHeader}
                />
                {children}
                <div className={css.footer}>
                    {!contentIsIntersecting && (
                        <div className={css.footerShadow} />
                    )}
                    <div className={css.footerContent}>{footer}</div>
                </div>
            </div>
        </div>
    )
}
