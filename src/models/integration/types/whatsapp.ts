// g/integrations/sms/schemas.py
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
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

export const isWhatsAppIntegration = (
    integration: Maybe<Integration>
): integration is WhatsAppIntegration =>
    integration?.type === IntegrationType.WhatsApp

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
