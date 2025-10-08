import { useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
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
import DEPRECATED_ConfigureRoutingBehaviorStep from './DEPRECATED_ConfigureRoutingBehaviorStep'
import VoiceIntegrationOnboardingForm from './VoiceIntegrationOnboardingForm'
import VoiceIntegrationOnboardingUnsavedChangesPrompt from './VoiceIntegrationOnboardingUnsavedChangesPrompt'

export default function VoiceIntegrationOnboarding() {
    const useExtendedFlowsGAReady = useFlag(
        FeatureFlagKey.ExtendedCallFlowsGAReady,
    )
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
                            {useExtendedFlowsGAReady ? (
                                <ConfigureRoutingBehaviorStep />
                            ) : (
                                <DEPRECATED_ConfigureRoutingBehaviorStep />
                            )}
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
