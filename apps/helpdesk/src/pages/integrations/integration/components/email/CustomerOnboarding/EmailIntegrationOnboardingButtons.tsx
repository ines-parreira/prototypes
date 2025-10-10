import React, { useContext, useEffect } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'
import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { WizardContext } from 'pages/common/components/wizard/Wizard'
import OnboardingDomainVerificationButtons from 'pages/integrations/integration/components/email/CustomerOnboarding/OnboardingDomainVerificationButtons'
import {
    EmailIntegrationOnboardingStep,
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

    const wizardContext = useContext(WizardContext)

    const verificationHasFailed = isRequested && !isPending && !isVerified

    useEffect(() => {
        wizardContext?.setActiveStep(currentStep)
    }, [currentStep, wizardContext])

    return (
        <div className={css.buttons}>
            <div className={css.buttonsStretch}>
                <Button
                    type="button"
                    intent="secondary"
                    onClick={props.cancelCallback}
                >
                    Cancel
                </Button>

                <div>
                    {currentStep !==
                        EmailIntegrationOnboardingStep.ConnectIntegration && (
                        <Button intent="secondary" onClick={goBack}>
                            Back
                        </Button>
                    )}
                    {currentStep ===
                        EmailIntegrationOnboardingStep.ConnectIntegration && (
                        <Button
                            type="submit"
                            isLoading={isConnecting}
                            isDisabled={isConnected ? false : undefined}
                        >
                            Next
                        </Button>
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
        </div>
    )
}
