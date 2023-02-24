import {EmailMigration, MigrationStatus} from 'models/integration/types'
import {getInboundUnverifiedMigrations} from '../EmailMigration/utils'

describe('migration utils', () => {
    describe('getInboundUnverifiedMigrations', () => {
        const createMigration = (migration: Partial<EmailMigration>) => ({
            status: MigrationStatus.Initiated,
            last_verification_email_sent_at: '',
            ...migration,
        })

        it('should return only unverified migrations', () => {
            const unverifiedMigration = createMigration({
                status: MigrationStatus.Initiated,
                integration: {
                    meta: {
                        address: 'first@gorgias.com',
                    },
                } as any,
            })
            const verifiedMigration = createMigration({
                status: MigrationStatus.InboundSuccess,
                integration: {meta: {address: 'second@gorgias.com'}} as any,
            })
            const migrations = [
                unverifiedMigration,
                verifiedMigration,
            ] as unknown as EmailMigration[]

            expect(getInboundUnverifiedMigrations(migrations)).toContainEqual(
                unverifiedMigration
            )
        })
    })
})
