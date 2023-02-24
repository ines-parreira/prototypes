import {EmailMigration, MigrationStatus} from 'models/integration/types'

export const getInboundUnverifiedMigrations = (
    migrations: EmailMigration[]
) => {
    return migrations.filter(
        (migration) => migration.status !== MigrationStatus.InboundSuccess
    )
}
