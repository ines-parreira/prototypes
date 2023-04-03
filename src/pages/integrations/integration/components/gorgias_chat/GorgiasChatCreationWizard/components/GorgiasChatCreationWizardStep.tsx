import React from 'react'

import {GorgiasChatCreationWizardSteps} from 'models/integration/types/gorgiasChat'

import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'

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
}) => (
    <>
        <div className={css.content}>
            <WizardProgressHeader
                labels={labels}
                className={css.wizardProgressHeader}
            />
            <div className={css.heading}>
                <div className={css.title}>{labels[step]}</div>
                {description[step] && (
                    <div className={css.description}>{description[step]}</div>
                )}
            </div>
            {children}
            <div className={css.footer}>{footer}</div>
        </div>
        <div className={css.preview}>
            <div className={css.previewCenter}>{preview}</div>
        </div>
    </>
)

export default GorgiasChatCreationWizardStep
