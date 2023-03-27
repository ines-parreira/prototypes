import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
} from 'models/integration/types'
import {
    computeMigrationInboundVerificationStatus,
    getInboundUnverifiedMigrations,
} from '../EmailMigration/utils'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

describe('migration utils', () => {
    describe('getInboundUnverifiedMigrations', () => {
        it('should return only unverified migrations', () => {
            const unverifiedMigration = {
                status: EmailMigrationInboundVerificationStatus.Initiated,
                integration: {
                    meta: {
                        address: 'first@gorgias.com',
                    },
                } as any,
            }
            const verifiedMigration = {
                status: EmailMigrationInboundVerificationStatus.InboundSuccess,
                integration: {meta: {address: 'second@gorgias.com'}} as any,
            }
            const partiallyVerifiedMigration = {
                status: EmailMigrationInboundVerificationStatus.InboundPartialSuccess,
                integration: {meta: {address: 'third@gorgias.com'}} as any,
            }

            const migrations = [
                unverifiedMigration,
                verifiedMigration,
                partiallyVerifiedMigration,
            ] as unknown as EmailMigrationInboundVerification[]

            const result = getInboundUnverifiedMigrations(migrations)
            expect(result).toHaveLength(1)
            expect(result).toContainEqual(unverifiedMigration)
        })
    })

    describe('computeMigrationInboundVerificationStatus', () => {
        it('should return Unverified when migration status is Initiated', () => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status: EmailMigrationInboundVerificationStatus.Initiated,
                } as any)
            ).toBe(EmailVerificationStatus.Unverified)
        })

        it.each([EmailMigrationInboundVerificationStatus.InboundPending])(
            'should return Pending when migration status is %s',
            (status) => {
                expect(
                    computeMigrationInboundVerificationStatus({
                        status,
                    } as any)
                ).toBe(EmailVerificationStatus.Pending)
            }
        )

        it.each([
            EmailMigrationInboundVerificationStatus.InboundFailed,
            EmailMigrationInboundVerificationStatus.InboundCriticalFailure,
        ])('should return Failed when migration status is %s', (status) => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status,
                } as any)
            ).toBe(EmailVerificationStatus.Failed)
        })

        it.each([
            EmailMigrationInboundVerificationStatus.InboundPartialSuccess,
            EmailMigrationInboundVerificationStatus.InboundSuccess,
        ])('should return Success when migration status is %s', (status) => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status,
                } as any)
            ).toBe(EmailVerificationStatus.Success)
        })
    })
})
