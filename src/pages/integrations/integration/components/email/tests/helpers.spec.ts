import {cloneDeep} from 'lodash'
import {EmailProvider} from 'models/integration/constants'
import {
    EmailIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'
import {
    getDomainFromEmailAddress,
    isBaseEmailAddress,
    isBaseEmailIntegration,
    isOutboundDomainVerified,
} from '../helpers'

const integration = {
    provider: EmailProvider.Sendgrid,
    meta: {
        outbound_verification_status: {
            single_sender: OutboundVerificationStatusValue.Unverified,
            domain: OutboundVerificationStatusValue.Unverified,
        },
    },
} as unknown as EmailIntegration

describe('helpers', () => {
    describe('isOutboundDomainVerified', () => {
        it('should return false when status is unverified', () => {
            const newIntegration = cloneDeep(integration)
            newIntegration.meta.outbound_verification_status.domain =
                OutboundVerificationStatusValue.Unverified
            expect(isOutboundDomainVerified(newIntegration)).toBe(false)
        })

        it('should return true when status is success', () => {
            const newIntegration = cloneDeep(integration)
            newIntegration.meta.outbound_verification_status.domain =
                OutboundVerificationStatusValue.Success
            expect(isOutboundDomainVerified(newIntegration)).toBe(true)
        })
    })

    describe('getDomainFromEmailAddress', () => {
        it('should return the domain', () => {
            expect(getDomainFromEmailAddress('email@gorgias-xyz.com')).toBe(
                'gorgias-xyz.com'
            )
        })
    })

    describe('isBaseEmailAddress', () => {
        window.GORGIAS_STATE = {
            integrations: {
                authentication: {
                    email: {
                        forwarding_email_address: 'gorgias.com',
                    },
                },
            },
        } as any

        it('should return false', () => {
            expect(isBaseEmailAddress('email@gorgias.com')).toBe(true)
        })

        it('should return true', () => {
            expect(isBaseEmailAddress('email@gorgias-xyz.com')).toBe(false)
        })
    })

    describe('isBaseEmailIntegration', () => {
        window.GORGIAS_STATE = {
            integrations: {
                authentication: {
                    email: {
                        forwarding_email_address: 'gorgias.com',
                    },
                },
            },
        } as any

        it('should return false', () => {
            expect(
                isBaseEmailIntegration({
                    meta: {
                        address: 'email@gorgias.com',
                    },
                } as any)
            ).toBe(true)
        })

        it('should return true', () => {
            expect(
                isBaseEmailIntegration({
                    meta: {
                        address: 'email@gorgias-xyz.com',
                    },
                } as any)
            ).toBe(false)
        })
    })
})
