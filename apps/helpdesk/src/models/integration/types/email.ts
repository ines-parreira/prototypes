// g/integrations/email/schemas.py
import type { SenderVerification } from 'models/singleSenderVerification/types'

import { EmailProvider, IntegrationType } from '../constants'
import type { Integration } from './'
import type { IntegrationBase } from './base'

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
export enum DNSRecordType {
    CNAME = 'cname',
    TXT = 'txt',
    MX = 'mx',
}

export type DomainDNSRecord = {
    verified: boolean
    record_type: string
    host: string
    value: string
    current_values?: Array<string>
}

export type EmailDomain = {
    name: string
    verified: boolean
    data: {
        sending_dns_records: Array<DomainDNSRecord>
    }
    provider?: EmailProvider
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

export enum EmailMigrationInboundVerificationStatus {
    Initiated = 'initiated',
    InboundPending = 'inbound_pending',
    InboundPartialSuccess = 'inbound_partial_success',
    InboundSuccess = 'inbound_success',
    InboundFailed = 'inbound_failed',
    InboundCriticalFailure = 'inbound_critical_failure',
    OutboundInitiated = 'outbound_initiated',
    OutboundPending = 'outbound_pending',
    OutboundSuccess = 'outbound_success',
    OutboundFailed = 'outbound_failed',
}

export type MigrationIntegration = {
    id: EmailIntegration['id']
    meta: Pick<
        EmailIntegrationMeta,
        'address' | 'verified' | 'provider' | 'preferred'
    >
}

export type EmailMigrationInboundVerification = {
    integration: MigrationIntegration
    status: EmailMigrationInboundVerificationStatus
}

export enum EmailMigrationOutboundVerificationStatus {
    Verified = 'success',
    Unverified = 'unverified',
}

export type EmailMigrationSenderVerificationIntegration = {
    id: EmailIntegration['id']
    meta: Pick<EmailIntegrationMeta, 'address'>
    migration: {
        status: EmailMigrationInboundVerificationStatus
    }
    sender_verification: Maybe<SenderVerification>
}

export type EmailMigrationOutboundVerification = {
    name: string
    status: EmailMigrationOutboundVerificationStatus
    domain: EmailDomain | Record<string, never>
    integrations: EmailMigrationSenderVerificationIntegration[]
}

export const isEmailIntegration = (
    integration: Maybe<Integration>,
): integration is EmailIntegration =>
    integration?.type === IntegrationType.Email
