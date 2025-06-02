import React, { useContext, useEffect } from 'react'

import classnames from 'classnames'

import { EmailIntegration } from '@gorgias/helpdesk-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import { FormSubmitButton } from 'core/forms'
import useLocalStorage from 'hooks/useLocalStorage'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { WizardContext } from 'pages/common/components/wizard/Wizard'
import OnboardingDomainVerificationButtons from 'pages/integrations/integration/components/email/CustomerOnboarding/OnboardingDomainVerificationButtons'
import {
    EmailIntegrationOnboardingStep,
    forwardingVerificationStorageKey,
    useEmailOnboarding,
} from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'

import css from './EmailIntegrationOnboardingButtons.less'

type Props = {
    integration?: EmailIntegration | undefined
    cancelCallback?: () => void
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
        isVerified,
        sendVerification,
    } = useEmailOnboarding(props)

    const [, , removeVerification] = useLocalStorage<Date | null>(
        forwardingVerificationStorageKey(integration?.id ?? 0),
        null,
    )
    const wizardContext = useContext(WizardContext)

    const verificationHasFailed = isRequested && !isPending && !isVerified

    useEffect(() => {
        wizardContext?.setActiveStep(currentStep)
    }, [currentStep, wizardContext])

    return (
        <div className={css.buttons}>
            {integration && (
                <ConfirmButton
                    type="button"
                    fillStyle="ghost"
                    confirmationContent="Are you sure you want to delete this integration?"
                    intent="destructive"
                    onConfirm={() => {
                        removeVerification()
                        deleteIntegration()
                    }}
                    leadingIcon="delete"
                >
                    Delete integration
                </ConfirmButton>
            )}
            <div className={classnames({ [css.buttonsStretch]: !integration })}>
                <Button
                    intent="secondary"
                    onClick={props.cancelCallback ?? goBack}
                >
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
                    EmailIntegrationOnboardingStep.SetupForwarding && (
                    <>
                        {verificationHasFailed ? (
                            <Button
                                isLoading={isSending}
                                onClick={sendVerification}
                            >
                                Send test email again
                            </Button>
                        ) : (
                            <Button
                                isLoading={isSending}
                                isDisabled={!isVerified}
                                onClick={goToNext}
                            >
                                Next
                            </Button>
                        )}
                    </>
                )}

                {currentStep ===
                    EmailIntegrationOnboardingStep.DomainVerification &&
                    integration && <OnboardingDomainVerificationButtons />}
            </div>
        </div>
    )
}
