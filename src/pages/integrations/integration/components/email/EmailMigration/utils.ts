import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
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
