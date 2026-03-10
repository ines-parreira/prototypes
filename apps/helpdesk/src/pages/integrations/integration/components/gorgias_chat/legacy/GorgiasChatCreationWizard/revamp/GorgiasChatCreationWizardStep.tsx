import { useEffect, useRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { SegmentEvent } from '@repo/logging'

import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'
import { StepperProgressHeader } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatCreationWizard/revamp/components/StepperProgressHeader'
import { ChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/ChatPreviewPanel'

import useLogWizardEvent from '../hooks/useLogWizardEvent'
import { STEP_LABELS } from './constants'

import css from './GorgiasChatCreationWizardStep.less'

type Props = {
    children: React.ReactNode
    footer: React.ReactNode
}

export const GorgiasChatCreationWizardStep = ({ children, footer }: Props) => {
    const logWizardEvent = useLogWizardEvent()
    const showScreenRevamp = useFlag(FeatureFlagKey.ChatSettingsScreensRevamp)
    const { setCollapsibleColumnChildren, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    const contentRef = useRef<HTMLDivElement>(null)
    const contentIsIntersecting =
        useIsIntersectingWithBrowserViewport(contentRef)

    useEffectOnce(() => {
        logWizardEvent(SegmentEvent.ChatWidgetWizardStepStarted)
    })

    useEffect(() => {
        setIsCollapsibleColumnOpen(showScreenRevamp)
        if (showScreenRevamp) {
            setCollapsibleColumnChildren(<ChatPreviewPanel />)
        }

        return () => {
            setIsCollapsibleColumnOpen(false)
            setCollapsibleColumnChildren(null)
        }
    }, [
        showScreenRevamp,
        setCollapsibleColumnChildren,
        setIsCollapsibleColumnOpen,
    ])

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
