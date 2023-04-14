import {isEmpty} from 'lodash'
import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
    EmailMigrationOutboundVerification,
    EmailMigrationOutboundVerificationStatus,
} from 'models/integration/types'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

export const computeMigrationInboundVerificationStatus = (
    migration: EmailMigrationInboundVerification
): EmailVerificationStatus => {
    if (
        migration.status === EmailMigrationInboundVerificationStatus.Initiated
    ) {
        return EmailVerificationStatus.Unverified
    }

    if (
        [
            EmailMigrationInboundVerificationStatus.InboundPartialSuccess,
            EmailMigrationInboundVerificationStatus.InboundSuccess,
            EmailMigrationInboundVerificationStatus.OutboundInitiated,
            EmailMigrationInboundVerificationStatus.OutboundSuccess,
        ].includes(migration.status)
    ) {
        return EmailVerificationStatus.Success
    }

    if (
        migration.status ===
        EmailMigrationInboundVerificationStatus.InboundPending
    ) {
        return EmailVerificationStatus.Pending
    }

    return EmailVerificationStatus.Failed
}

export const getInboundUnverifiedMigrations = (
    migrations: EmailMigrationInboundVerification[]
) => {
    return migrations.filter(
        (migration) =>
            computeMigrationInboundVerificationStatus(migration) !==
            EmailVerificationStatus.Success
    )
}

export const computeSingleSenderVerificationStatus = (
    verification: EmailMigrationOutboundVerification
) => {
    const submittedVerifications = verification.integrations.filter(
        (integration) => !isEmpty(integration.sender_verification)
    )

    if (!submittedVerifications.length) {
        return EmailVerificationStatus.Unverified
    }

    const incompleteVerifications = submittedVerifications.filter(
        (integration) =>
            integration.migration.status !==
            EmailMigrationInboundVerificationStatus.OutboundSuccess
    )

    return incompleteVerifications.length
        ? EmailVerificationStatus.Pending
        : EmailVerificationStatus.Success
}

export const computeDomainVerificationStatus = (
    verification: EmailMigrationOutboundVerification
) => {
    return verification.status ===
        EmailMigrationOutboundVerificationStatus.Unverified
        ? EmailVerificationStatus.Unverified
        : EmailVerificationStatus.Success
}
