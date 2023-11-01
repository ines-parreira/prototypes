import React from 'react'
import {useEffectOnce} from 'react-use'

import {SegmentEvent} from 'common/segment'

import {GorgiasChatCreationWizardSteps} from 'models/integration/types/gorgiasChat'

import useIsIntersectingWithBrowserViewport from 'pages/common/hooks/useIsIntersectingWithBrowserViewport'

import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'

import useLogWizardEvent from '../hooks/useLogWizardEvent'

import css from './GorgiasChatCreationWizardStep.less'

type Props = {
    step: GorgiasChatCreationWizardSteps
    preview: React.ReactNode
    footer: React.ReactNode
}

const labels: Record<GorgiasChatCreationWizardSteps, string> = {
    [GorgiasChatCreationWizardSteps.Basics]: 'Set up the basics',
    [GorgiasChatCreationWizardSteps.Branding]: 'Customize your chat',
    [GorgiasChatCreationWizardSteps.Installation]: 'Install and launch',
}

const description: Partial<Record<GorgiasChatCreationWizardSteps, string>> = {
    [GorgiasChatCreationWizardSteps.Branding]:
        "Give the chat widget your brand's look and feel",
    [GorgiasChatCreationWizardSteps.Installation]:
        'Install the chat widget on your website and make it available for customers',
}

const GorgiasChatCreationWizardStep: React.FC<Props> = ({
    step,
    children,
    preview,
    footer,
}) => {
    const logWizardEvent = useLogWizardEvent()

    const contentRef = React.useRef<HTMLDivElement>(null)
    const contentIsIntersecting =
        useIsIntersectingWithBrowserViewport(contentRef)

    useEffectOnce(() => {
        logWizardEvent(SegmentEvent.ChatWidgetWizardStepStarted)
    })

    return (
        <>
            <div className={css.wizard}>
                <div className={css.content} ref={contentRef}>
                    <WizardProgressHeader
                        labels={labels}
                        className={css.wizardProgressHeader}
                    />
                    <div className={css.heading}>
                        <div className={css.title}>{labels[step]}</div>
                        {description[step] && (
                            <div className={css.description}>
                                {description[step]}
                            </div>
                        )}
                    </div>
                    {children}
                </div>
                <div className={css.footer}>
                    {!contentIsIntersecting && (
                        <div className={css.footerShadow}></div>
                    )}
                    <div className={css.footerContent}>{footer}</div>
                </div>
            </div>
            <div className={css.preview}>
                <div className={css.previewCenter}>{preview}</div>
            </div>
        </>
    )
}

export default GorgiasChatCreationWizardStep
