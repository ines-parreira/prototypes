import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import WizardFooter from 'pages/common/components/wizard/WizardFooter'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AI_AGENT_STEPS_DESCRIPTIONS,
    AI_AGENT_STEPS_LABELS,
    AI_AGENT_STEPS_TITLES,
} from '../constants'
import {AiAgentOnboardingWizardProps} from './AiAgentOnboardingWizard'

type Props = AiAgentOnboardingWizardProps

const AiAgentOnboardingWizardStepPersonalize: React.FC<Props> = () => {
    const isAiAgentOnboardingWizardEducationalStep =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]

    return (
        <>
            <WizardStepSkeleton
                step={AiAgentOnboardingWizardStep.Personalize}
                labels={AI_AGENT_STEPS_LABELS}
                titles={AI_AGENT_STEPS_TITLES}
                descriptions={AI_AGENT_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displaySaveAndCustomizeLater={
                            !!isAiAgentOnboardingWizardEducationalStep
                        }
                        displayBackButton={
                            !!isAiAgentOnboardingWizardEducationalStep
                        }
                        displayCancelButton={
                            !isAiAgentOnboardingWizardEducationalStep
                        }
                        displayNextButton
                        onClick={() => {}}
                    />
                }
                preview={<div>Ai Agent Preview</div>}
            >
                <div>AI Agent Onboarding Wizard Step Personalize Content</div>
            </WizardStepSkeleton>
        </>
    )
}

export default AiAgentOnboardingWizardStepPersonalize
