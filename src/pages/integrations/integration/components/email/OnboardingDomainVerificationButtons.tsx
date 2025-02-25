import React from 'react'

import { Link } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import LinkButton from 'pages/common/components/button/LinkButton'

import { SUPPORT_EMAIL } from './EmailDomainVerification/constants'
import useDomainVerification from './EmailDomainVerification/useDomainVerification'
import { listUrl } from './hooks/useEmailOnboarding'

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
        <>
            <Link to={listUrl()}>
                <Button intent="secondary">Close</Button>
            </Link>
            <Button
                intent="primary"
                onClick={verifyDomain}
                isLoading={isVerifying || isPending}
                isDisabled={isDisabled}
            >
                Check status
            </Button>
        </>
    )
}
