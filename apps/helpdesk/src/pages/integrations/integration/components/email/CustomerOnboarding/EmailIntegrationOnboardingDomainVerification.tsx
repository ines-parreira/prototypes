import React, { useEffect } from 'react'

import type { EmailIntegration } from '@gorgias/helpdesk-queries'

import EmailIntegrationOnboardingButtons from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingButtons'
import OnboardingDomainVerificationPrompt from 'pages/integrations/integration/components/email/CustomerOnboarding/OnboardingDomainVerificationPrompt'
import EmailDomainVerificationContent from 'pages/integrations/integration/components/email/EmailDomainVerification/EmailDomainVerificationContent'
import useDomainVerification from 'pages/integrations/integration/components/email/EmailDomainVerification/useDomainVerification'
import { isCommonDomainEmail } from 'pages/integrations/integration/components/email/helpers'
import { useEmailOnboardingCompleteCheck } from 'pages/integrations/integration/components/email/hooks/useEmailOnboarding'

type Props = {
    integration: EmailIntegration
    handleCancel: () => void
}

export default function EmailIntegrationOnboardingDomainVerification({
    integration,
    handleCancel,
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
            <EmailIntegrationOnboardingButtons
                integration={integration}
                cancelCallback={handleCancel}
            />
            <OnboardingDomainVerificationPrompt
                when={!domain?.verified && !isCommonDomainAddress}
            />
        </>
    )
}
