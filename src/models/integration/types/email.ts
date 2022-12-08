// g/integrations/email/schemas.py

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
    Domain = 'domain',
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

export const isEmailIntegration = createTypeGuard<
    Maybe<Integration>,
    EmailIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Email ? input : undefined
)
