import React from 'react'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import WizardFooter from 'pages/common/components/wizard/WizardFooter'
import {
    AI_AGENT_STEPS_DESCRIPTIONS,
    AI_AGENT_STEPS_LABELS,
    AI_AGENT_STEPS_TITLES,
} from '../constants'
import {AiAgentOnboardingWizardProps} from './AiAgentOnboardingWizard'

type Props = AiAgentOnboardingWizardProps

const AiAgentOnboardingWizardStepEducation: React.FC<Props> = () => {
    return (
        <>
            <WizardStepSkeleton
                step={AiAgentOnboardingWizardStep.Education}
                labels={AI_AGENT_STEPS_LABELS}
                titles={AI_AGENT_STEPS_TITLES}
                descriptions={AI_AGENT_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displayNextButton
                        displayCancelButton
                        onClick={() => {}}
                    />
                }
                preview={<div>AI Agent Educational Video</div>}
            >
                <div>AI Agent Onboarding Wizard Step Education Content</div>
            </WizardStepSkeleton>
        </>
    )
}

export default AiAgentOnboardingWizardStepEducation
