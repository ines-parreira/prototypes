import {EmailMigration, MigrationStatus} from 'models/integration/types'
import {getMomentNow} from 'utils/date'

export const emailMigrations = [
    {
        integration: {
            id: 1,
            meta: {
                address: 'support1@customer.com',
            },
        },
        status: MigrationStatus.Initiated,
        last_verification_email_sent_at: '',
    },
    {
        integration: {
            id: 2,
            meta: {
                address: 'support2@customer.com',
            },
        },
        status: MigrationStatus.InboundPending,
        last_verification_email_sent_at: getMomentNow(),
    },
    {
        integration: {
            id: 3,
            meta: {
                address: 'support3@customer.com',
            },
        },
        status: MigrationStatus.InboundSuccess,
        last_verification_email_sent_at: '',
    },
    {
        integration: {
            id: 4,
            meta: {
                address: 'support4@customer.com',
            },
        },
        status: MigrationStatus.InboundFailed,
        last_verification_email_sent_at: '',
    },
    {
        integration: {
            id: 5,
            meta: {
                address: 'support5@customer.com',
            },
        },
        status: MigrationStatus.InboundCriticalFailure,
        last_verification_email_sent_at: '',
    },
    {
        integration: {
            id: 6,
            meta: {
                address: 'support6@customer.com',
            },
        },
        status: MigrationStatus.InboundCriticalFailure,
        last_verification_email_sent_at: '',
    },
    {
        integration: {
            id: 7,
            meta: {
                address: 'support7@customer.com',
            },
        },
        status: MigrationStatus.InboundCriticalFailure,
        last_verification_email_sent_at: '',
    },
] as unknown as EmailMigration[]
