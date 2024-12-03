import {EmailIntegration} from '@gorgias/api-queries'
import React, {useEffect} from 'react'

import EmailDomainVerificationContent from './EmailDomainVerification/EmailDomainVerificationContent'
import useDomainVerification from './EmailDomainVerification/useDomainVerification'
import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'
import {useEmailOnboardingCompleteCheck} from './hooks/useEmailOnboarding'
import OnboardingDomainVerificationPrompt from './OnboardingDomainVerificationPrompt'

type Props = {
    integration: EmailIntegration
}

export default function EmailIntegrationOnboardingDomainVerification({
    integration,
}: Props) {
    const {completeOnboarding} = useEmailOnboardingCompleteCheck(integration)
    const {domain} = useDomainVerification()

    useEffect(() => {
        if (domain?.verified) {
            completeOnboarding()
        }
    }, [domain?.verified, completeOnboarding])

    return (
        <>
            <EmailDomainVerificationContent integration={integration} />
            <EmailIntegrationOnboardingButtons integration={integration} />
            <OnboardingDomainVerificationPrompt when={!domain?.verified} />
        </>
    )
}
