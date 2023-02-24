// g/integrations/email/schemas.py

import {createTypeGuard} from '../../../utils'

import {EmailProvider, IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {GmailIntegration, Integration, OutlookIntegration} from './'

export enum OutboundVerificationStatusValue {
    Unverified = 'unverified',
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
}

export enum OutboundVerificationType {
    SingleSender = 'single_sender',
    Domain = 'domain',
}

export enum EmailMigrationStatus {
    Enabled = 'enabled',
    Pending = 'pending',
    Completed = 'completed',
    Missed = 'missed',
}

export type EmailIntegration = IntegrationBase & {
    type: IntegrationType.Email
    meta: EmailIntegrationMeta
}

export type EmailIntegrationMeta = {
    address: string
    preferred: boolean
    signature?: EmailSignature
    verified?: boolean
    email_forwarding_activated?: boolean
    dkim_enabled?: boolean
    smtp?: Maybe<{
        host: string
        port: string
        ssl: boolean
        user: string
    }>
    provider: EmailProvider
    outbound_verification_status: {
        [OutboundVerificationType.SingleSender]: OutboundVerificationStatusValue
        [OutboundVerificationType.Domain]: OutboundVerificationStatusValue
    }
}

export type DomainDNSRecord = {
    verified: boolean
    record_type: string
    host: string
    value: string
    current_values: Array<string>
}

export type EmailDomain = {
    name: string
    verified: boolean
    data: {
        sending_dns_records: Array<DomainDNSRecord>
    }
}

export type EmailSignature = {
    text: string
    html: string
}

export type EmailMigrationBannerStatus = {
    status: EmailMigrationStatus | null
    started_at: string | null
    due_at: string | null
}

export enum MigrationStatus {
    Initiated = 'INITIATED',
    InboundPending = 'INBOUND_PENDING',
    InboundPartialSuccess = 'INBOUND_PARTIAL_SUCCESS',
    InboundSuccess = 'INBOUND_SUCCESS',
    InboundFailed = 'INBOUND_FAILED',
    InboundCriticalFailure = 'INBOUND_CRITICAL_FAILURE',
}

export type EmailMigration = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    status: MigrationStatus
    last_verification_email_sent_at: string
}

export const isEmailIntegration = createTypeGuard<
    Maybe<Integration>,
    EmailIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Email ? input : undefined
)
