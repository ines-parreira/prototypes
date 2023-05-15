// g/integrations/sms/schemas.py

import {createTypeGuard} from 'utils'
import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type WhatsAppIntegration = IntegrationBase & {
    type: IntegrationType.WhatsApp
    meta: WhatsAppIntegrationMeta
}

export type WhatsAppIntegrationMeta = {
    emoji?: string
    phone_number_id: number
    routing: {
        phone_number: string
    }
}

export const isWhatsAppIntegration = createTypeGuard<
    Maybe<Integration>,
    WhatsAppIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.WhatsApp ? input : undefined
)

export type WhatsAppMigrationProgress = {
    waba_phone_number_id: string
    status: WhatsAppPhoneNumberStatus
    verification_status: WhatsAppPhoneNumberVerificationStatus
}

export enum WhatsAppPhoneNumberStatus {
    Online = 'ONLINE',
    Pending = 'PENDING',
    Offline = 'OFFLINE',
    Migrated = 'MIGRATED',
    Connected = 'CONNECTED',
}

export enum WhatsAppPhoneNumberVerificationStatus {
    Unverified = 'UNVERIFIED',
    Verified = 'VERIFIED',
}

export enum WhatsAppCodeVerificationMethod {
    Voice = 'VOICE',
    Sms = 'SMS',
}

export type WhatsAppTemplateComponents = {
    body: {
        type: string
        value: string
    }
}

export type WhatsAppTemplate = {
    components: WhatsAppTemplateComponents
    category: WhatsAppTemplateCategory
    id: string
    external_id: string
    language: string
    name: string
    status: WhatsAppTemplateStatus
    waba_id: string
}

export enum WhatsAppTemplateCategory {
    Utility = 'UTILITY',
    Marketing = 'MARKETING',
    Authentication = 'AUTHENTICATION',
}

export enum WhatsAppTemplateStatus {
    Approved = 'APPROVED',
    Rejected = 'REJECTED',
    Pending = 'PENDING',
    InAppeal = 'IN_APPEAL',
    Disabled = 'DISABLED',
    Paused = 'PAUSED',
    Unsupported = 'UNSUPPORTED',
}
