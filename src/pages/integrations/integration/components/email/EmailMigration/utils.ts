import {isEmpty} from 'lodash'

import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
    EmailMigrationOutboundVerification,
    EmailMigrationOutboundVerificationStatus,
    EmailMigrationSenderVerificationIntegration,
} from 'models/integration/types'
import {VerificationStatus} from 'models/singleSenderVerification/types'

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

export const getSingleSenderUnverifiedIntegrations = (
    verification: EmailMigrationOutboundVerification
) => {
    return verification.integrations.filter(
        (integration) =>
            computeSingleSenderVerificationStatus(integration) !==
            EmailVerificationStatus.Success
    )
}

export const getSubmittedSingleSenderVerificationsForDomain = (
    verification: EmailMigrationOutboundVerification
) => {
    return verification.integrations.filter(
        (integration) => !isEmpty(integration.sender_verification)
    )
}

export const getSubmittedIncompleteVerifications = (
    verification: EmailMigrationOutboundVerification
) => {
    return verification.integrations.filter(
        (integration) =>
            !isEmpty(integration.sender_verification) &&
            [
                EmailVerificationStatus.Pending,
                EmailVerificationStatus.Failed,
            ].includes(computeSingleSenderVerificationStatus(integration))
    )
}

/* single sender verification status for an individual domain */
export const computeSingleSenderVerificationStatus = (
    integration: EmailMigrationSenderVerificationIntegration
) => {
    const status = integration.sender_verification?.status

    if (status === VerificationStatus.Verified) {
        return EmailVerificationStatus.Success
    }

    if (status === VerificationStatus.Failed) {
        return EmailVerificationStatus.Failed
    }

    return isEmpty(integration.sender_verification)
        ? EmailVerificationStatus.Unverified
        : EmailVerificationStatus.Pending
}

/* single sender verification status for a specific domain */
export const computeDomainSingleSenderVerificationStatus = (
    verification: EmailMigrationOutboundVerification
) => {
    const allSubmittedVerifications =
        getSubmittedSingleSenderVerificationsForDomain(verification)
    const submittedIncompleteVerifications =
        getSubmittedIncompleteVerifications(verification)

    if (!allSubmittedVerifications.length) {
        return EmailVerificationStatus.Unverified
    }

    /* if any of the submitted verifications failed, status is failed */
    if (
        allSubmittedVerifications.some(
            (integration) =>
                computeSingleSenderVerificationStatus(integration) ===
                EmailVerificationStatus.Failed
        )
    ) {
        return EmailVerificationStatus.Failed
    }

    return submittedIncompleteVerifications.length
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

export const listAddressDetailsInline = (
    integration: EmailMigrationSenderVerificationIntegration
) => {
    const {address, city, state, zip, country} =
        integration.sender_verification ?? {}
    const stateAndZip = [state, zip].filter(Boolean).join(' ')
    return [address, city, stateAndZip, country].filter(Boolean).join(', ')
}
