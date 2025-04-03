import { useContext } from 'react'

import { WizardContext } from 'pages/common/components/wizard/Wizard'

import VoiceFormUnsavedChangesPrompt from '../VoiceFormUnsavedChangesPrompt'
import { VoiceIntegrationOnboardingStep } from './constants'
import { useOnboardingForm } from './useVoiceOnboardingForm'

type VoiceIntegrationOnboardingUnsavedChangesPromptProps = {
    hasNewPhoneNumber: boolean
}

export default function VoiceIntegrationOnboardingUnsavedChangesPrompt({
    hasNewPhoneNumber,
}: VoiceIntegrationOnboardingUnsavedChangesPromptProps) {
    const { onSubmit } = useOnboardingForm()
    const wizardContext = useContext(WizardContext)

    const body = hasNewPhoneNumber ? (
        <p>
            If you leave now, your phone number will still be created, but you
            won’t have a call flow configured. You can finish setup later from
            the <strong>Integrations</strong> or <strong>Phone Numbers</strong>{' '}
            settings.
        </p>
    ) : undefined

    return (
        <VoiceFormUnsavedChangesPrompt
            title="Leave voice integration setup?"
            body={body}
            onSave={onSubmit}
            shouldShowSaveButton={
                wizardContext?.activeStep ===
                VoiceIntegrationOnboardingStep.ConfigureRoutingBehavior
            }
        />
    )
}
