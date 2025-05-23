import React, { useEffect } from 'react'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { isCommonDomainEmail } from 'pages/integrations/integration/components/email/helpers'

import EmailDomainVerificationContent from './EmailDomainVerification/EmailDomainVerificationContent'
import useDomainVerification from './EmailDomainVerification/useDomainVerification'
import EmailIntegrationOnboardingButtons from './EmailIntegrationOnboardingButtons'
import { useEmailOnboardingCompleteCheck } from './hooks/useEmailOnboarding'
import OnboardingDomainVerificationPrompt from './OnboardingDomainVerificationPrompt'

type Props = {
    integration: EmailIntegration
}

export default function EmailIntegrationOnboardingDomainVerification({
    integration,
}: Props) {
    const { completeOnboarding } = useEmailOnboardingCompleteCheck(integration)
    const { domain } = useDomainVerification()
    const isCommonDomainAddress = isCommonDomainEmail(integration.meta?.address)

    useEffect(() => {
        if (domain?.verified || isCommonDomainAddress) {
            completeOnboarding()
        }
    }, [domain?.verified, completeOnboarding, isCommonDomainAddress])

    return (
        <>
            <EmailDomainVerificationContent integration={integration} />
            <EmailIntegrationOnboardingButtons integration={integration} />
            <OnboardingDomainVerificationPrompt
                when={!domain?.verified && !isCommonDomainAddress}
            />
        </>
    )
}
