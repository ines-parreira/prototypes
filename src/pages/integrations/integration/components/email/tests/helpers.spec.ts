import axios from 'axios'
import {cloneDeep} from 'lodash'
import MockAdapter from 'axios-mock-adapter'
import {EmailProvider, IntegrationType} from 'models/integration/constants'
import {
    DomainDNSRecord,
    EmailIntegration,
    GmailIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'
import {
    canEnableEmailingViaInternalProvider,
    getDNSRecord,
    getDomainFromEmailAddress,
    isBaseEmailAddress,
    isBaseEmailIntegration,
    isOutboundDomainVerified,
    isOutboundVerifiedSendgrid,
    isSendgridEmailIntegration,
    isSingleSenderVerificationInProgress,
    isSingleSenderVerified,
    populateCurrentValuesForDNSRecords,
    removeDomainFromDNSRecord,
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

const gmailIntegration = {
    id: 1,
    name: 'Gmail integration',
    meta: {
        address: 'support@gorgi.us',
        outbound_verification_status: {
            domain: OutboundVerificationStatusValue.Unverified,
        },
    },
} as GmailIntegration

const mockedServer = new MockAdapter(axios)

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

    describe('CanEnableEmailingViaInternalProvider', () => {
        it.each([EmailProvider.Mailgun, EmailProvider.Sendgrid])(
            'should return false when domain is not verified [%s]',
            (provider) => {
                const gmailIntegrationClone = cloneDeep(gmailIntegration)
                gmailIntegrationClone.meta.outbound_verification_status.domain =
                    OutboundVerificationStatusValue.Unverified
                gmailIntegrationClone.meta.provider = provider
                expect(
                    canEnableEmailingViaInternalProvider(gmailIntegrationClone)
                ).toBe(false)
            }
        )

        it.each([EmailProvider.Mailgun, EmailProvider.Sendgrid])(
            'should return true when domain is verified [%s]',
            (provider) => {
                const gmailIntegrationClone = cloneDeep(gmailIntegration)
                gmailIntegrationClone.meta.outbound_verification_status.domain =
                    OutboundVerificationStatusValue.Success
                gmailIntegrationClone.meta.provider = provider
                expect(
                    canEnableEmailingViaInternalProvider(gmailIntegrationClone)
                ).toBe(true)
            }
        )
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

    describe('removeDomainFromDNSRecord()', () => {
        it('remove the domain part from a DNS record host', () => {
            expect(
                removeDomainFromDNSRecord(
                    {
                        host: 'em12345.mydomain.com',
                        value: 'ok',
                    } as DomainDNSRecord,
                    'mydomain.com'
                )
            ).toEqual({
                host: 'em12345',
                value: 'ok',
            })
        })

        it('return the same record if the domain is not valid or not matched', () => {
            expect(
                removeDomainFromDNSRecord(
                    {
                        host: 'em12345.mydomain.com',
                        value: 'ok',
                    } as DomainDNSRecord,
                    'a-different-domain.com'
                )
            ).toEqual({
                host: 'em12345.mydomain.com',
                value: 'ok',
            })

            expect(
                removeDomainFromDNSRecord({
                    host: 'em12345.mydomain.com',
                    value: 'ok',
                } as DomainDNSRecord)
            ).toEqual({
                host: 'em12345.mydomain.com',
                value: 'ok',
            })
        })
    })

    describe('getDNSRecord()', () => {
        it('returns the correct answer on a successful query', async () => {
            const expectedResponse = ['ok']
            mockedServer.onGet('https://dns.google/resolve').reply(200, {
                Status: 0,
                Answer: expectedResponse,
            })

            const response = await getDNSRecord('gorgias.com', 'CNAME')
            expect(response).toEqual(expectedResponse)
        })

        it('returns null if the query did not succeed', async () => {
            mockedServer.onGet('https://dns.google/resolve').reply(200, {
                Status: 2,
                Answer: [],
            })

            const response = await getDNSRecord('gorgias.com', 'CNAME')
            expect(response).toEqual(null)
        })

        it('returns null on transport/network/server failures', async () => {
            mockedServer.onGet('https://dns.google/resolve').reply(500, null)

            const response = await getDNSRecord('gorgias.com', 'CNAME')
            expect(response).toEqual(null)
        })
    })

    describe('populateCurrentValuesForDNSRecords()', () => {
        it('populates the current_values for all matching records, ignoring errors or unmatched ones', async () => {
            mockedServer.onGet('https://dns.google/resolve').reply((config) => {
                const {name, type} = config.params as {
                    name: string
                    type: string
                }
                switch (name) {
                    case 'gorgias.com':
                    case 'gorgias.gorgias.com':
                        return [
                            200,
                            {
                                Status: 0,
                                Answer: [
                                    {
                                        name: name,
                                        TTL: 100,
                                        type: 99,
                                        data: `dns-query-response-${type}-ok`,
                                    },
                                ],
                            },
                        ]
                    default:
                        return [400]
                }
            })

            const records = [
                {
                    host: 'gorgias.com',
                    record_type: 'MX',
                },
                {
                    host: 'gorgias.gorgias.com',
                    record_type: 'CNAME',
                },
                {
                    host: 'unmatched.gorgias.com',
                    record_type: 'MX',
                },
            ] as DomainDNSRecord[]

            expect(await populateCurrentValuesForDNSRecords(records)).toEqual([
                {
                    host: 'gorgias.com',
                    record_type: 'MX',
                    current_values: ['dns-query-response-MX-ok'],
                },
                {
                    host: 'gorgias.gorgias.com',
                    record_type: 'CNAME',
                    current_values: ['dns-query-response-CNAME-ok'],
                },
                {
                    host: 'unmatched.gorgias.com',
                    record_type: 'MX',
                },
            ])
        })

        it('leaves the records untouched if the DNS queries fail', async () => {
            mockedServer.onGet('https://dns.google/resolve').reply(500)
            const records = [
                {
                    host: 'gorgias.com',
                    record_type: 'MX',
                },
                {
                    host: 'gorgias.gorgias.com',
                    record_type: 'CNAME',
                },
                {
                    host: 'unmatched.gorgias.com',
                    record_type: 'MX',
                },
            ] as DomainDNSRecord[]

            expect(await populateCurrentValuesForDNSRecords(records)).toEqual(
                records
            )
        })
    })
})
