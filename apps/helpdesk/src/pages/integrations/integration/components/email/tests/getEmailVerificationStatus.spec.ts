import { EmailIntegration, GmailIntegration } from '@gorgias/helpdesk-queries'

import { EmailProvider } from 'models/integration/constants'
import {
    IntegrationType,
    OutboundVerificationStatusValue,
    OutboundVerificationType,
    OutlookIntegration,
} from 'models/integration/types'

import {
    EmailVerificationStatus,
    getEmailVerificationStatus,
} from '../getEmailVerificationStatus'
import {
    canIntegrationDomainBeVerified,
    isBaseEmailIntegration,
} from '../helpers'

jest.mock('../helpers')

const canIntegrationDomainBeVerifiedMock = jest.mocked(
    canIntegrationDomainBeVerified,
)
const isBaseEmailIntegrationMock = jest.mocked(isBaseEmailIntegration)

describe('getEmailVerificationStatus', () => {
    beforeEach(() => {
        canIntegrationDomainBeVerifiedMock.mockReturnValue(true)
        isBaseEmailIntegrationMock.mockReturnValue(false)
    })

    describe('Email integrations (forward email)', () => {
        const createEmailIntegration = (
            overrides: Partial<EmailIntegration> = {},
        ): EmailIntegration => ({
            id: 1,
            name: 'Test Email',
            type: IntegrationType.Email,
            meta: {
                address: 'test@example.com',
                preferred: false,
                verified: true,
                provider: EmailProvider.Sendgrid,
                outbound_verification_status: {
                    [OutboundVerificationType.SingleSender]:
                        OutboundVerificationStatusValue.Unverified,
                    [OutboundVerificationType.Domain]:
                        OutboundVerificationStatusValue.Unverified,
                },
                ...overrides.meta,
            },
            deactivated_datetime: null,
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-01T00:00:00Z',
            decoration: null,
            ...overrides,
        })

        it('should return Verified when email is verified and domain cannot be verified', () => {
            canIntegrationDomainBeVerifiedMock.mockReturnValue(false)
            const integration = createEmailIntegration({
                meta: {
                    address: 'test@example.com',
                    verified: true,
                    preferred: false,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            })

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })

        it('should return Verified when it is a base integration', () => {
            isBaseEmailIntegrationMock.mockReturnValue(true)
            const integration = createEmailIntegration({
                meta: {
                    address: 'test@gorgias.com',
                    verified: false,
                    preferred: false,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            })

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })

        it('should return UnverifiedEmail when email is not verified', () => {
            const integration = createEmailIntegration({
                meta: {
                    address: 'test@example.com',
                    verified: false,
                    preferred: false,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            })

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.UnverifiedEmail)
        })

        it('should return UnverifiedDomain when domain verification is required', () => {
            const integration = createEmailIntegration({
                meta: {
                    address: 'test@example.com',
                    verified: true,
                    preferred: false,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            })

            const result = getEmailVerificationStatus(integration, true)

            expect(result).toBe(EmailVerificationStatus.UnverifiedDomain)
        })

        it('should return Verified when email is verified and domain verification is not required', () => {
            const integration = createEmailIntegration({
                meta: {
                    address: 'test@example.com',
                    verified: true,
                    preferred: false,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                },
            })

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })
    })

    describe('Gmail integrations', () => {
        const createGmailIntegration = (
            overrides: Partial<GmailIntegration> = {},
        ): GmailIntegration =>
            ({
                id: 1,
                name: 'Test Gmail',
                type: IntegrationType.Gmail,
                meta: {
                    address: 'test@gmail.com',
                    preferred: false,
                    verified: true,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                    import_activated: true,
                    use_gmail_categories: false,
                    enable_gmail_sending: true,
                    enable_gmail_threading: true,
                    importation: {},
                    sync: {},
                    oauth: {
                        status: 'success' as const,
                        error: '',
                        scope: 'email',
                    },
                    use_new_creds_version: true,
                    ...overrides.meta,
                },
                deactivated_datetime: null,
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-01T00:00:00Z',
                decoration: null,
                ...overrides,
            }) as GmailIntegration

        it('should return Verified when Gmail integration is active and domain cannot be verified', () => {
            canIntegrationDomainBeVerifiedMock.mockReturnValue(false)
            const integration = createGmailIntegration()

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })

        it('should return UnconnectedEmail when Gmail integration is not active', () => {
            const integration = createGmailIntegration({
                deactivated_datetime: '2023-01-01T00:00:00Z',
            })

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.UnconnectedEmail)
        })

        it('should return UnverifiedDomain when domain verification is required for Gmail', () => {
            const integration = createGmailIntegration()

            const result = getEmailVerificationStatus(integration, true)

            expect(result).toBe(EmailVerificationStatus.UnverifiedDomain)
        })

        it('should return Verified when Gmail integration is active and domain verification is not required', () => {
            const integration = createGmailIntegration()

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })
    })

    describe('Outlook integrations', () => {
        const createOutlookIntegration = (
            overrides: Partial<OutlookIntegration> = {},
        ): OutlookIntegration =>
            ({
                id: 1,
                name: 'Test Outlook',
                type: IntegrationType.Outlook,
                meta: {
                    address: 'test@outlook.com',
                    outlook_user_id: 'user123',
                    subscription: {
                        id: 'sub123',
                        expiration_datetime: '2024-01-01T00:00:00Z',
                    },
                    oauth: {
                        status: 'success' as const,
                        error: '',
                        scope: 'email',
                    },
                    provider: 'outlook',
                    import_state: {
                        enabled: true,
                        is_over: false,
                        next_page_link: null,
                    },
                    enable_outlook_sending: true,
                    preferred: false,
                    ...overrides.meta,
                },
                deactivated_datetime: null,
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-01T00:00:00Z',
                decoration: null,
                ...overrides,
            }) as OutlookIntegration

        it('should return Verified when Outlook integration is active and domain cannot be verified', () => {
            canIntegrationDomainBeVerifiedMock.mockReturnValue(false)
            const integration = createOutlookIntegration()

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })

        it('should return UnconnectedEmail when Outlook integration is not active', () => {
            const integration = createOutlookIntegration({
                deactivated_datetime: '2023-01-01T00:00:00Z',
            })

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.UnconnectedEmail)
        })

        it('should return UnverifiedDomain when domain verification is required for Outlook', () => {
            const integration = createOutlookIntegration()

            const result = getEmailVerificationStatus(integration, true)

            expect(result).toBe(EmailVerificationStatus.UnverifiedDomain)
        })

        it('should return Verified when Outlook integration is active and domain verification is not required', () => {
            const integration = createOutlookIntegration()

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })
    })

    describe('Edge cases', () => {
        it('should handle missing verified property in email integration meta', () => {
            const integration = {
                id: 1,
                name: 'Test Email',
                type: IntegrationType.Email,
                meta: {
                    address: 'test@example.com',
                    preferred: false,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                    // verified property is missing
                },
                deactivated_datetime: null,
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-01T00:00:00Z',
                decoration: null,
            } as EmailIntegration

            const result = getEmailVerificationStatus(integration, false)

            expect(result).toBe(EmailVerificationStatus.Verified)
        })

        it('should return UnconnectedEmail when deactivated non-email integration with domain verification', () => {
            const integration = {
                id: 1,
                name: 'Test Gmail',
                type: IntegrationType.Gmail,
                meta: {
                    address: 'test@gmail.com',
                    preferred: false,
                    verified: true,
                    provider: EmailProvider.Sendgrid,
                    outbound_verification_status: {
                        [OutboundVerificationType.SingleSender]:
                            OutboundVerificationStatusValue.Unverified,
                        [OutboundVerificationType.Domain]:
                            OutboundVerificationStatusValue.Unverified,
                    },
                    import_activated: true,
                    use_gmail_categories: false,
                    enable_gmail_sending: true,
                    enable_gmail_threading: true,
                    importation: {},
                    sync: {},
                    oauth: {
                        status: 'success' as const,
                        error: '',
                        scope: 'email',
                    },
                    use_new_creds_version: true,
                },
                deactivated_datetime: '2023-01-01T00:00:00Z',
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-01T00:00:00Z',
                decoration: null,
            } as GmailIntegration

            const result = getEmailVerificationStatus(integration, true)

            expect(result).toBe(EmailVerificationStatus.UnconnectedEmail)
        })
    })
})
