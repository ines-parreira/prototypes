import type {
    EmailMigrationInboundVerification,
    EmailMigrationOutboundVerification,
} from 'models/integration/types'
import {
    EmailMigrationInboundVerificationStatus,
    EmailMigrationOutboundVerificationStatus,
} from 'models/integration/types'

export const emailMigrations = [
    {
        integration: {
            id: 1,
            meta: {
                address: 'support1@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.Initiated,
    },
    {
        integration: {
            id: 2,
            meta: {
                address: 'support2@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundPending,
    },
    {
        integration: {
            id: 3,
            meta: {
                address: 'support3@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundSuccess,
    },
    {
        integration: {
            id: 4,
            meta: {
                address: 'support4@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundFailed,
    },
    {
        integration: {
            id: 5,
            meta: {
                address: 'support5@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundCriticalFailure,
    },
    {
        integration: {
            id: 6,
            meta: {
                address: 'support6@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundCriticalFailure,
    },
    {
        integration: {
            id: 7,
            meta: {
                address: 'support7@customer.com',
            },
        },
        status: EmailMigrationInboundVerificationStatus.InboundCriticalFailure,
    },
] as unknown as EmailMigrationInboundVerification[]

export const migrationOutboundVerificationUnverifiedDomain = {
    name: 'test-unverified-domain.com',
    status: 'not_verified',
    domain: {
        name: 'test.com',
        verified: false,
        data: {
            sending_dns_records: [
                {
                    verified: false,
                    value: 'k=rsa; t=s; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDK9SHdNsiBRkQRMgT8RYb0rb1AwuhVPvggpp12K+m73yw3ba0i0xEYo2g1JpRBwcZKvWzolsw/QMYpygVBbcNIzNrl6s6HHxNc9p1a7gbedoX2ZMg0uGQu9E4q/Ph6AsMvU6uh2vgRDKUp7LZvL1a1lJ2u7stzNDaU57RQzJBY6wIDAQAB',
                    host: 'm1._domainkey.toto.com',
                    record_type: 'txt',
                },
                {
                    verified: false,
                    value: 'mx.sendgrid.net.',
                    host: 'em9428.toto.com',
                    record_type: 'mx',
                },
                {
                    verified: false,
                    value: 'v=spf1 include:sendgrid.net ~all',
                    host: 'em9428.toto.com',
                    record_type: 'txt',
                },
            ],
            valid: false,
        },
        provider: 'sendgrid',
    },
    integrations: [],
} as unknown as EmailMigrationOutboundVerification

export const migrationOutboundVerificationVerifiedDomain = {
    name: 'test-verified-domain.com',
    status: 'success',
    domain: {
        name: 'toto.com',
        verified: false,
        data: {
            sending_dns_records: [
                {
                    verified: true,
                    value: 'k=rsa; t=s; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDK9SHdNsiBRkQRMgT8RYb0rb1AwuhVPvggpp12K+m73yw3ba0i0xEYo2g1JpRBwcZKvWzolsw/QMYpygVBbcNIzNrl6s6HHxNc9p1a7gbedoX2ZMg0uGQu9E4q/Ph6AsMvU6uh2vgRDKUp7LZvL1a1lJ2u7stzNDaU57RQzJBY6wIDAQAB',
                    host: 'm1._domainkey.toto.com',
                    record_type: 'txt',
                },
                {
                    verified: true,
                    value: 'mx.sendgrid.net.',
                    host: 'em9428.toto.com',
                    record_type: 'mx',
                },
                {
                    verified: true,
                    value: 'v=spf1 include:sendgrid.net ~all',
                    host: 'em9428.toto.com',
                    record_type: 'txt',
                },
            ],
            valid: true,
        },
        provider: 'sendgrid',
    },
    integrations: [
        {
            meta: {
                address: 'toto@test.com',
                outbound_verification_status: {
                    sender_verification: 'unverified',
                    domain: 'verified',
                },
            },
        },
    ],
} as unknown as EmailMigrationOutboundVerification

export const migrationOutboundVerificationNotStarted = {
    name: 'test-not-started.com',
    status: EmailMigrationOutboundVerificationStatus.Unverified,
    integrations: [],
    domain: {},
} as unknown as EmailMigrationOutboundVerification

export const migrationOutboundVerificationUnverifiedSingleSender = {
    name: 'test-single-sender-unverified.com',
    status: EmailMigrationOutboundVerificationStatus.Unverified,
    domain: {},
    integrations: [
        {
            id: 11,
            meta: {
                address: 'user@gorgias.com',
            },
            sender_verification: {
                email: 'user@gorgias.com',
                verified_at: null,
                created_datetime: '2023-03-02T14:13:03.339896+00:00',
                updated_datetime: '2023-03-02T14:13:03.701012+00:00',
                last_email_sent_at: '2023-03-02T14:13:03.700752+00:00',
                address: 'Some address',
                state: '',
                city: 'Paris',
                zip: '75000',
                country: 'France',
                status: 'unverified',
            },
        },
    ],
} as unknown as EmailMigrationOutboundVerification

export const migrationOutboundVerificationFailedSingleSender = {
    name: 'test-single-sender-unverified.com',
    status: EmailMigrationOutboundVerificationStatus.Unverified,
    domain: {},
    integrations: [
        {
            id: 11,
            meta: {
                address: 'user@gorgias.com',
            },
            sender_verification: {
                email: 'user@gorgias.com',
                verified_at: null,
                created_datetime: '2023-03-02T14:13:03.339896+00:00',
                updated_datetime: '2023-03-02T14:13:03.701012+00:00',
                last_email_sent_at: '2023-03-02T14:13:03.700752+00:00',
                address: 'Some address',
                state: '',
                city: 'Paris',
                zip: '75000',
                country: 'France',
                status: 'unverified',
            },
        },
        {
            id: 12,
            meta: {
                address: 'user2@gorgias.com',
            },
            sender_verification: {
                email: 'user2@gorgias.com',
                verified_at: null,
                created_datetime: '2023-03-02T14:13:03.339896+00:00',
                updated_datetime: '2023-03-02T14:13:03.701012+00:00',
                last_email_sent_at: '2023-03-02T14:13:03.700752+00:00',
                address: 'Some address',
                state: '',
                city: 'Paris',
                zip: '75000',
                country: 'France',
                status: 'failed',
            },
        },
    ],
} as unknown as EmailMigrationOutboundVerification

export const migrationOutboundVerificationVerifiedSingleSender = {
    name: 'single-sender-verified.com',
    status: 'success',
    domain: {},
    integrations: [
        {
            id: 11,
            meta: {
                address: 'test@toto.com',
            },
            sender_verification: {
                email: 'test@toto.com',
                verified_at: null,
                created_datetime: '2023-03-02T14:13:03.339896+00:00',
                updated_datetime: '2023-03-02T14:13:03.701012+00:00',
                last_email_sent_at: '2023-03-02T14:13:03.700752+00:00',
                address: 'Some address',
                state: '',
                city: 'Paris',
                zip: '75000',
                country: 'France',
                status: 'verified',
            },
        },
    ],
} as unknown as EmailMigrationOutboundVerification

export const migrationOutboundVerifications = [
    migrationOutboundVerificationVerifiedSingleSender,
    migrationOutboundVerificationUnverifiedSingleSender,
    migrationOutboundVerificationUnverifiedDomain,
    migrationOutboundVerificationVerifiedDomain,
    migrationOutboundVerificationNotStarted,
]
