import Wizard from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import AddPhoneNumberStep from './AddPhoneNumberStep'
import ConfigureCallFlowStep from './ConfigureCallFlowStep'
import {
    onboardingStepsLabels,
    VoiceIntegrationOnboardingStep,
} from './constants'
import VoiceIntegrationOnboardingForm from './VoiceIntegrationOnboardingForm'

export default function VoiceIntegrationOnboarding() {
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
                            <AddPhoneNumberStep />
                        </WizardStep>
                        <WizardStep
                            name={
                                VoiceIntegrationOnboardingStep.ConfigureCallFlow
                            }
                        >
                            <ConfigureCallFlowStep />
                        </WizardStep>
                    </VoiceIntegrationOnboardingForm>
                </Wizard>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
