import { Button } from '@gorgias/merchant-ui-kit'

import LinkButton from 'pages/common/components/button/LinkButton'
import { SUPPORT_EMAIL } from 'pages/integrations/integration/components/email/EmailDomainVerification/constants'
import useDomainVerification from 'pages/integrations/integration/components/email/EmailDomainVerification/useDomainVerification'

export default function OnboardingDomainVerificationButtons() {
    const {
        domain,
        isCreatingDomain,
        errors,
        isFetching,
        verifyDomain,
        isVerifying,
        isPending,
    } = useDomainVerification()

    const isDisabled = !domain || isCreatingDomain || isFetching

    if (errors.createDomain) {
        return (
            <LinkButton intent="primary" href={`mailto:${SUPPORT_EMAIL}`}>
                Contact support
            </LinkButton>
        )
    }

    return (
        <Button
            intent="primary"
            onClick={verifyDomain}
            isLoading={isVerifying || isPending}
            isDisabled={isDisabled}
        >
            Check status
        </Button>
    )
}
