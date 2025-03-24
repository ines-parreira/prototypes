import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import VoiceIntegrationOnboardingCancelButton from './VoiceIntegrationOnboardingCancelButton'

import css from './VoiceIntegrationOnboardingStep.less'

export default function ConfigureCallFlowStep() {
    const { goToPreviousStep } = useNavigateWizardSteps()

    return (
        <>
            <div>
                <h1>Configure call flow</h1>
            </div>
            <div className={css.buttons}>
                <VoiceIntegrationOnboardingCancelButton />
                <div className={css.navigationButtons}>
                    <Button intent="secondary" onClick={goToPreviousStep}>
                        Back
                    </Button>
                    <Button intent="primary">Create phone integration</Button>
                </div>
            </div>
        </>
    )
}
