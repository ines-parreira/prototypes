import {EmailMigration, MigrationStatus} from 'models/integration/types'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

export const computeMigrationInboundVerificationStatus = (
    migration: EmailMigration
): EmailVerificationStatus => {
    if (migration.status === MigrationStatus.Initiated) {
        return EmailVerificationStatus.Unverified
    }

    if (
        [
            MigrationStatus.InboundPartialSuccess,
            MigrationStatus.InboundSuccess,
        ].includes(migration.status)
    ) {
        return EmailVerificationStatus.Success
    }

    if (migration.status === MigrationStatus.InboundPending) {
        return EmailVerificationStatus.Pending
    }

    return EmailVerificationStatus.Failed
}

export const getInboundUnverifiedMigrations = (
    migrations: EmailMigration[]
) => {
    return migrations.filter(
        (migration) =>
            computeMigrationInboundVerificationStatus(migration) !==
            EmailVerificationStatus.Success
    )
}
