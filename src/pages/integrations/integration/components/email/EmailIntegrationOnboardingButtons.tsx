import React, { useContext, useEffect } from 'react'

import { EmailIntegration } from '@gorgias/api-queries'

import { FormSubmitButton } from 'core/forms'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { WizardContext } from 'pages/common/components/wizard/Wizard'

import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'
import OnboardingDomainVerificationButtons from './OnboardingDomainVerificationButtons'

import css from './EmailIntegrationOnboardingButtons.less'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboardingButtons(props: Props) {
    const {
        integration,
        deleteIntegration,
        goBack,
        goToNext,
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
                {currentStep === EmailIntegrationOnboardingStep.Verification &&
                    (integration?.meta?.verified ? (
                        <Button intent="primary" onClick={goToNext}>
                            Next
                        </Button>
                    ) : (
                        <FormSubmitButton
                            isLoading={isSending}
                            isDisabled={isPending}
                            leadingIcon={isRequested ? 'markunread' : undefined}
                        >
                            {isRequested
                                ? 'Re-Send Verification Email'
                                : 'Begin Verification'}
                        </FormSubmitButton>
                    ))}
                {currentStep ===
                    EmailIntegrationOnboardingStep.DomainVerification &&
                    integration && <OnboardingDomainVerificationButtons />}
            </div>

            {integration && (
                <ConfirmButton
                    type="button"
                    fillStyle="ghost"
                    confirmationContent="Are you sure you want to delete this integration?"
                    intent="destructive"
                    onConfirm={deleteIntegration}
                    leadingIcon="delete"
                >
                    Delete integration
                </ConfirmButton>
            )}
        </div>
    )
}
