// g/integrations/email/schemas.py

import {SenderInformation} from 'models/singleSenderVerification/types'
import {createTypeGuard} from '../../../utils'

import {EmailProvider, IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

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

export enum EmailMigrationInboundVerificationStatus {
    Initiated = 'initiated',
    InboundPending = 'inbound_pending',
    InboundPartialSuccess = 'inbound_partial_success',
    InboundSuccess = 'inbound_success',
    InboundFailed = 'inbound_failed',
    InboundCriticalFailure = 'inbound_critical_failure',
}

export type MigrationIntegration = {
    id: EmailIntegration['id']
    meta: Pick<EmailIntegrationMeta, 'address' | 'verified' | 'provider'>
}

export type EmailMigrationInboundVerification = {
    integration: MigrationIntegration
    status: EmailMigrationInboundVerificationStatus
}

export enum EmailMigrationOutboundVerificationStatus {
    Verified = 'verified',
    Unverified = 'not_verified',
}

export type EmailMigrationSenderVerificationIntegration = {
    id: EmailIntegration['id']
    meta: Pick<EmailIntegrationMeta, 'address'>
    migration: {
        status: EmailMigrationInboundVerificationStatus
    }
    sender: SenderInformation
}

export type EmailMigrationSenderVerification = {
    integrations: EmailMigrationSenderVerificationIntegration[]
}

export type EmailMigrationOutboundVerification = {
    name: string
    status: EmailMigrationOutboundVerificationStatus
    domain: EmailDomain
    sender_verification: EmailMigrationSenderVerification
}

export const isEmailIntegration = createTypeGuard<
    Maybe<Integration>,
    EmailIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Email ? input : undefined
)
