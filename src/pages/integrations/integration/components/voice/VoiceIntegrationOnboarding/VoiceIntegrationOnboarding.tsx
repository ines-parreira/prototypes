import { useState } from 'react'

import Wizard from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import AddPhoneNumberStep from './AddPhoneNumberStep'
import ConfigureRoutingBehaviorStep from './ConfigureRoutingBehaviorStep'
import {
    onboardingStepsLabels,
    VoiceIntegrationOnboardingStep,
} from './constants'
import VoiceIntegrationOnboardingForm from './VoiceIntegrationOnboardingForm'
import VoiceIntegrationOnboardingUnsavedChangesPrompt from './VoiceIntegrationOnboardingUnsavedChangesPrompt'

export default function VoiceIntegrationOnboarding() {
    const [hasNewPhoneNumber, setHasNewPhoneNumber] = useState(false)

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <Wizard
                    startAt={VoiceIntegrationOnboardingStep.AddPhoneNumber}
                    steps={Object.values(VoiceIntegrationOnboardingStep)}
                >
                    <VoiceIntegrationOnboardingForm>
                        <WizardProgressHeader labels={onboardingStepsLabels} />
                        <WizardStep
                            name={VoiceIntegrationOnboardingStep.AddPhoneNumber}
                        >
                            <AddPhoneNumberStep
                                onCreateNewNumber={() =>
                                    setHasNewPhoneNumber(true)
                                }
                            />
                        </WizardStep>
                        <WizardStep
                            name={
                                VoiceIntegrationOnboardingStep.ConfigureRoutingBehavior
                            }
                        >
                            <ConfigureRoutingBehaviorStep />
                        </WizardStep>
                        <VoiceIntegrationOnboardingUnsavedChangesPrompt
                            hasNewPhoneNumber={hasNewPhoneNumber}
                        />
                    </VoiceIntegrationOnboardingForm>
                </Wizard>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
