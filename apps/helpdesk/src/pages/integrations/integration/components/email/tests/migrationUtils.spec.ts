import {
    migrationOutboundVerificationFailedSingleSender,
    migrationOutboundVerificationNotStarted,
    migrationOutboundVerificationUnverifiedSingleSender,
    migrationOutboundVerificationVerifiedDomain,
    migrationOutboundVerificationVerifiedSingleSender,
} from 'fixtures/emailMigration'
import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
} from 'models/integration/types'
import { VerificationStatus } from 'models/singleSenderVerification/types'

import {
    computeDomainSingleSenderVerificationStatus,
    computeDomainVerificationStatus,
    computeMigrationInboundVerificationStatus,
    computeSingleSenderVerificationStatus,
    getInboundUnverifiedMigrations,
    getSingleSenderUnverifiedIntegrations,
    listAddressDetailsInline,
} from '../EmailMigration/utils'
import { EmailVerificationStatus } from '../EmailVerificationStatusLabel'

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
                integration: { meta: { address: 'second@gorgias.com' } } as any,
            }
            const partiallyVerifiedMigration = {
                status: EmailMigrationInboundVerificationStatus.InboundPartialSuccess,
                integration: { meta: { address: 'third@gorgias.com' } } as any,
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
                } as any),
            ).toBe(EmailVerificationStatus.Unverified)
        })

        it.each([EmailMigrationInboundVerificationStatus.InboundPending])(
            'should return Pending when migration status is %s',
            (status) => {
                expect(
                    computeMigrationInboundVerificationStatus({
                        status,
                    } as any),
                ).toBe(EmailVerificationStatus.Pending)
            },
        )

        it.each([
            EmailMigrationInboundVerificationStatus.InboundFailed,
            EmailMigrationInboundVerificationStatus.InboundCriticalFailure,
        ])('should return Failed when migration status is %s', (status) => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status,
                } as any),
            ).toBe(EmailVerificationStatus.Failed)
        })

        it.each([
            EmailMigrationInboundVerificationStatus.InboundPartialSuccess,
            EmailMigrationInboundVerificationStatus.InboundSuccess,
        ])('should return Success when migration status is %s', (status) => {
            expect(
                computeMigrationInboundVerificationStatus({
                    status,
                } as any),
            ).toBe(EmailVerificationStatus.Success)
        })
    })

    describe('computeDomainVerificationStatus', () => {
        describe('selected verification type - Domain verification', () => {
            it('should return Unverified when status is unverified', () => {
                const result = computeDomainVerificationStatus(
                    migrationOutboundVerificationNotStarted,
                )
                expect(result).toBe(EmailVerificationStatus.Unverified)
            })

            it('should return Success when status is verified', () => {
                const result = computeDomainVerificationStatus(
                    migrationOutboundVerificationVerifiedDomain,
                )
                expect(result).toBe(EmailVerificationStatus.Success)
            })
        })
    })

    describe('getSingleSenderUnverifiedIntegrations', () => {
        it('should return only unverified integrations', () => {
            const unverifiedIntegration = {
                sender_verification: {},
            }
            const verifiedIntegration = {
                sender_verification: { status: VerificationStatus.Verified },
            }

            const result = getSingleSenderUnverifiedIntegrations({
                integrations: [unverifiedIntegration, verifiedIntegration],
            } as any)
            expect(result).toHaveLength(1)
            expect(result).toContainEqual(unverifiedIntegration)
        })
    })

    describe('computeSingleSenderVerificationStatus', () => {
        it('should return Success when status is verified', () => {
            const result = computeSingleSenderVerificationStatus({
                sender_verification: {
                    status: VerificationStatus.Verified,
                },
            } as any)
            expect(result).toBe(EmailVerificationStatus.Success)
        })

        it('should return Unverified when sender information is not available', () => {
            const result = computeSingleSenderVerificationStatus({
                sender_verification: {},
            } as any)
            expect(result).toBe(EmailVerificationStatus.Unverified)
        })

        it('should return Pending when sender information is available', () => {
            const result = computeSingleSenderVerificationStatus({
                sender_verification: {
                    email: 'abc@gorgias.com',
                },
            } as any)
            expect(result).toBe(EmailVerificationStatus.Pending)
        })

        it('should return Failed when status is failed', () => {
            const result = computeSingleSenderVerificationStatus({
                sender_verification: {
                    status: VerificationStatus.Failed,
                },
            } as any)
            expect(result).toBe(EmailVerificationStatus.Failed)
        })
    })

    describe('computeDomainSingleSenderVerificationStatus', () => {
        it('should return Unverified when no single sender verifications are submitted', () => {
            const result = computeDomainSingleSenderVerificationStatus(
                migrationOutboundVerificationNotStarted,
            )
            expect(result).toBe(EmailVerificationStatus.Unverified)
        })

        it('should return Pending when single sender verifications are submitted and they are not verified yet', () => {
            const result = computeDomainSingleSenderVerificationStatus(
                migrationOutboundVerificationUnverifiedSingleSender,
            )
            expect(result).toBe(EmailVerificationStatus.Pending)
        })

        it('should return Failed when single sender verifications are submitted and some of them failed', () => {
            const result = computeDomainSingleSenderVerificationStatus(
                migrationOutboundVerificationFailedSingleSender,
            )
            expect(result).toBe(EmailVerificationStatus.Failed)
        })

        it('should return Success when single sender verifications are submitted and they are verified', () => {
            const result = computeDomainSingleSenderVerificationStatus(
                migrationOutboundVerificationVerifiedSingleSender,
            )
            expect(result).toBe(EmailVerificationStatus.Success)
        })
    })

    describe('listAddressDetailsInline', () => {
        it('should return a string with all the addresses', () => {
            const result = listAddressDetailsInline({
                sender_verification: {
                    address: '611 Mission Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zip: '94105',
                    country: 'US',
                },
            } as any)
            expect(result).toBe(
                '611 Mission Street, San Francisco, CA 94105, US',
            )
        })

        it('should return a string with all the addresses except the state', () => {
            const result = listAddressDetailsInline({
                sender_verification: {
                    address: '611 Mission Street',
                    city: 'San Francisco',
                    zip: '94105',
                    country: 'US',
                },
            } as any)
            expect(result).toBe('611 Mission Street, San Francisco, 94105, US')
        })

        it('should return a string with all the addresses except the state and the zip', () => {
            const result = listAddressDetailsInline({
                sender_verification: {
                    address: '611 Mission Street',
                    city: 'San Francisco',
                    country: 'US',
                },
            } as any)
            expect(result).toBe('611 Mission Street, San Francisco, US')
        })
    })
})
