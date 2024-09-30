import React, {useContext, useEffect} from 'react'

import {EmailIntegration} from 'models/integration/types'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import FormSubmitButton from 'pages/settings/SLAs/features/SLAForm/views/FormSubmitButton'
import {WizardContext} from 'pages/common/components/wizard/Wizard'

import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'

import css from './EmailIntegrationOnboardingButtons.less'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboardingButtons(props: Props) {
    const {
        integration,
        deleteIntegration,
        goBack,
        currentStep,
        isConnected,
        isConnecting,
        isRequested,
        isSending,
        isPending,
    } = useEmailOnboarding(props)

    const wizardContext = useContext(WizardContext)

    useEffect(() => {
        wizardContext?.setActiveStep(currentStep)
    }, [currentStep, wizardContext])

    return (
        <div className={css.buttons}>
            <div>
                <Button intent="secondary" onClick={goBack}>
                    {currentStep ===
                    EmailIntegrationOnboardingStep.ConnectIntegration
                        ? 'Cancel'
                        : 'Back'}
                </Button>
                {currentStep ===
                    EmailIntegrationOnboardingStep.ConnectIntegration && (
                    <FormSubmitButton
                        isLoading={isConnecting}
                        isDisabled={isConnected ? false : undefined}
                    >
                        Next
                    </FormSubmitButton>
                )}
                {currentStep ===
                    EmailIntegrationOnboardingStep.ForwardingSetup && (
                    <FormSubmitButton
                        isLoading={isSending}
                        isDisabled={isRequested ? false : undefined}
                    >
                        {isRequested ? 'Next' : 'Begin Verification'}
                    </FormSubmitButton>
                )}
                {currentStep ===
                    EmailIntegrationOnboardingStep.Verification && (
                    <FormSubmitButton
                        isLoading={isSending}
                        isDisabled={isPending}
                    >
                        {isRequested ? (
                            <ButtonIconLabel icon="markunread">
                                Re-Send Verification Email
                            </ButtonIconLabel>
                        ) : (
                            'Begin Verification'
                        )}
                    </FormSubmitButton>
                )}
            </div>

            {integration && (
                <ConfirmButton
                    type="button"
                    fillStyle="ghost"
                    confirmationContent="Are you sure you want to delete this integration?"
                    intent="destructive"
                    onConfirm={deleteIntegration}
                >
                    <ButtonIconLabel icon="delete">
                        Delete Email Address
                    </ButtonIconLabel>
                </ConfirmButton>
            )}
        </div>
    )
}
