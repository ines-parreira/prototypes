import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import useSearch from 'hooks/useSearch'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import VoiceIntegrationOnboardingCancelButton from './VoiceIntegrationOnboardingCancelButton'

import css from './VoiceIntegrationOnboardingStep.less'

export default function AddPhoneNumberStep() {
    const { phoneNumberId } = useSearch<{
        phoneNumberId: string
    }>()
    const { goToNextStep } = useNavigateWizardSteps()

    return (
        <>
            <div>
                <h1>Add phone number</h1>
                <p>
                    {phoneNumberId
                        ? `Phone number id ${phoneNumberId} selected`
                        : 'No phone number id found'}
                </p>
            </div>
            <div className={css.buttons}>
                <VoiceIntegrationOnboardingCancelButton />
                <Button intent="primary" onClick={goToNextStep}>
                    Next
                </Button>
            </div>
        </>
    )
}
