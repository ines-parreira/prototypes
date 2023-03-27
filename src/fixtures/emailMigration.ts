import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
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
