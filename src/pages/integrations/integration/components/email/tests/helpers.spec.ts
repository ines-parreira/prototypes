import {cloneDeep} from 'lodash'
import {EmailProvider, IntegrationType} from 'models/integration/constants'
import {
    EmailIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'
import {
    getDomainFromEmailAddress,
    isOutboundDomainVerified,
    isOutboundVerifiedSendgrid,
    isSingleSenderVerificationInProgress,
    isSingleSenderVerified,
    isBaseEmailAddress,
    isBaseEmailIntegration,
    isSendgridEmailIntegration,
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
    describe('isSingleSenderVerificationInProgress', () => {
        it.each([
            OutboundVerificationStatusValue.Failure,
            OutboundVerificationStatusValue.Pending,
        ])('should return true when status is %s', (status) => {
            const newIntegration = cloneDeep(integration)
            newIntegration.meta.outbound_verification_status.single_sender =
                status
            expect(isSingleSenderVerificationInProgress(newIntegration)).toBe(
                true
            )
        })

        it.each([
            OutboundVerificationStatusValue.Unverified,
            OutboundVerificationStatusValue.Success,
        ])('should return false when status is %s', (status) => {
            const newIntegration = cloneDeep(integration)
            newIntegration.meta.outbound_verification_status.single_sender =
                status
            expect(isSingleSenderVerificationInProgress(newIntegration)).toBe(
                false
            )
        })
    })

    describe('isOutboundVerifiedSendgrid', () => {
        it.each`
            domain                                        | singleSender                                  | result
            ${OutboundVerificationStatusValue.Unverified} | ${OutboundVerificationStatusValue.Unverified} | ${false}
            ${OutboundVerificationStatusValue.Unverified} | ${OutboundVerificationStatusValue.Pending}    | ${false}
            ${OutboundVerificationStatusValue.Unverified} | ${OutboundVerificationStatusValue.Failure}    | ${false}
            ${OutboundVerificationStatusValue.Unverified} | ${OutboundVerificationStatusValue.Success}    | ${true}
            ${OutboundVerificationStatusValue.Success}    | ${OutboundVerificationStatusValue.Unverified} | ${true}
            ${OutboundVerificationStatusValue.Success}    | ${OutboundVerificationStatusValue.Pending}    | ${true}
            ${OutboundVerificationStatusValue.Success}    | ${OutboundVerificationStatusValue.Failure}    | ${true}
            ${OutboundVerificationStatusValue.Success}    | ${OutboundVerificationStatusValue.Success}    | ${true}
        `(
            'should return $result when domain is $domain and single sender is $singleSender',
            ({domain, singleSender, result}) => {
                const newIntegration = cloneDeep(integration)
                newIntegration.meta.outbound_verification_status.domain = domain
                newIntegration.meta.outbound_verification_status.single_sender =
                    singleSender
                expect(isOutboundVerifiedSendgrid(newIntegration)).toBe(result)
            }
        )
    })

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

    describe('isSingleSenderVerified', () => {
        it('should return false when status is unverified', () => {
            const newIntegration = cloneDeep(integration)
            newIntegration.meta.outbound_verification_status.single_sender =
                OutboundVerificationStatusValue.Unverified
            expect(isSingleSenderVerified(newIntegration)).toBe(false)
        })

        it('should return true when status is success', () => {
            const newIntegration = cloneDeep(integration)
            newIntegration.meta.outbound_verification_status.single_sender =
                OutboundVerificationStatusValue.Success
            expect(isSingleSenderVerified(newIntegration)).toBe(true)
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

    describe('isSendgridEmailIntegration', () => {
        it('should return false for mailgun integrations', () => {
            expect(
                isSendgridEmailIntegration({
                    type: IntegrationType.Email,
                    meta: {
                        provider: EmailProvider.Mailgun,
                    },
                } as any)
            )
        })

        it('should return false for sendgrid outlook integrations', () => {
            expect(
                isSendgridEmailIntegration({
                    type: IntegrationType.Outlook,
                    meta: {
                        provider: EmailProvider.Sendgrid,
                    },
                } as any)
            )
        })

        it('should return false for sendgrid gmail integrations', () => {
            expect(
                isSendgridEmailIntegration({
                    type: IntegrationType.Gmail,
                    meta: {
                        provider: EmailProvider.Sendgrid,
                    },
                } as any)
            )
        })

        it('should return true for sendgrid email integrations', () => {
            expect(
                isSendgridEmailIntegration({
                    type: IntegrationType.Email,
                    meta: {
                        provider: EmailProvider.Sendgrid,
                    },
                } as any)
            )
        })
    })
})
