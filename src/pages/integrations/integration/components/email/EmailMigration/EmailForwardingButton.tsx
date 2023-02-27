import React from 'react'
import {EmailMigration} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'
import {
    computeMigrationInboundVerificationStatus,
    isLastVerificationEmailJustSent,
} from './utils'

type Props = {
    migration: EmailMigration
}

export default function EmailForwardingButton({migration}: Props) {
    const verificationStatus =
        computeMigrationInboundVerificationStatus(migration)

    const isLastEmailJustSent = isLastVerificationEmailJustSent(
        migration.last_verification_email_sent_at
    )
    const isRetryDisabled =
        verificationStatus === EmailVerificationStatus.Pending &&
        isLastEmailJustSent

    if (verificationStatus === EmailVerificationStatus.Unverified) {
        return <Button fillStyle="ghost">Verify forwarding</Button>
    }

    if (isRetryDisabled) {
        return (
            <Button fillStyle="ghost" isLoading={true}>
                Verifying
            </Button>
        )
    }

    return (
        <Button fillStyle="ghost" intent="secondary">
            <ButtonIconLabel icon="refresh">Retry verification</ButtonIconLabel>
        </Button>
    )
}
