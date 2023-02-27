import {EmailMigration, MigrationStatus} from 'models/integration/types'
import * as dateUtils from 'utils/date'
import {
    computeMigrationInboundVerificationStatus,
    getInboundUnverifiedMigrations,
    isLastVerificationEmailJustSent,
} from '../EmailMigration/utils'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'

describe('migration utils', () => {
    describe('getInboundUnverifiedMigrations', () => {
        it('should return only unverified migrations', () => {
            const unverifiedMigration = {
                status: MigrationStatus.Initiated,
                integration: {
                    meta: {
                        address: 'first@gorgias.com',
                    },
                } as any,
            }
            const verifiedMigration = {
                status: MigrationStatus.InboundSuccess,
                integration: {meta: {address: 'second@gorgias.com'}} as any,
            }
            const partiallyVerifiedMigration = {
                status: MigrationStatus.InboundPartialSuccess,
                integration: {meta: {address: 'third@gorgias.com'}} as any,
                last_verification_email_sent_at: '',
            }

            const migrations = [
                unverifiedMigration,
                verifiedMigration,
                partiallyVerifiedMigration,
            ] as unknown as EmailMigration[]

            const result = getInboundUnverifiedMigrations(migrations)
            expect(result).toHaveLength(1)
            expect(result).toContainEqual(unverifiedMigration)
        })
    })

    describe('computeMigrationInboundVerificationStatus', () => {
        it('should return Unverified when migration status is Initiated', () => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status: MigrationStatus.Initiated,
                } as any)
            ).toBe(EmailVerificationStatus.Unverified)
        })

        it.each([MigrationStatus.InboundPending])(
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
            MigrationStatus.InboundFailed,
            MigrationStatus.InboundCriticalFailure,
        ])('should return Failed when migration status is %s', (status) => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status,
                } as any)
            ).toBe(EmailVerificationStatus.Failed)
        })

        it.each([
            MigrationStatus.InboundPartialSuccess,
            MigrationStatus.InboundSuccess,
        ])('should return Success when migration status is %s', (status) => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status,
                } as any)
            ).toBe(EmailVerificationStatus.Success)
        })
    })

    describe('isLastVerificationEmailJustSent', () => {
        jest.spyOn(dateUtils, 'getMoment').mockImplementation((): any =>
            dateUtils.stringToDatetime('2023-01-10T00:10')
        )

        it.each(['2023-01-10T00:05', '2023-01-10T00:08'])(
            'should return false when the last email was sent more than 2 minutes ago',
            (timestamp) => {
                expect(isLastVerificationEmailJustSent(timestamp)).toBeFalsy()
            }
        )

        it('should return true when the last email was sent less than 2 minutes ago', () => {
            expect(
                isLastVerificationEmailJustSent('2023-01-10T00:09')
            ).toBeTruthy()
        })
    })
})
