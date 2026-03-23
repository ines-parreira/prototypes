import type { FieldConfig, SectionKey } from '../types'
import {
    ADDRESSES_FIELD_DEFINITIONS,
    DEFAULT_ADDRESS_FIELD_DEFINITIONS,
} from './addressFieldDefinitions'
import { createMarketingConsentFields } from './createMarketingConsentFields'
import { FIELD_DEFINITIONS } from './fields'

const EMAIL_CONSENT_FIELD_DEFINITIONS = createMarketingConsentFields(
    (ctx) => ctx.emailMarketingConsent?.email_marketing_consent,
)
const SMS_CONSENT_FIELD_DEFINITIONS = createMarketingConsentFields(
    (ctx) => ctx.smsMarketingConsent?.sms_marketing_consent,
)

export type SectionConfig = {
    key: SectionKey
    label: string
    fieldDefinitions: Record<string, FieldConfig>
    dragType: string
}

export const SECTION_CONFIGS: SectionConfig[] = [
    {
        key: 'customer',
        label: 'Customer',
        fieldDefinitions: FIELD_DEFINITIONS,
        dragType: 'field-customer',
    },
    {
        key: 'defaultAddress',
        label: 'Default Address',
        fieldDefinitions: DEFAULT_ADDRESS_FIELD_DEFINITIONS,
        dragType: 'field-default-address',
    },
    {
        key: 'emailMarketingConsent',
        label: 'Email Marketing Consent',
        fieldDefinitions: EMAIL_CONSENT_FIELD_DEFINITIONS,
        dragType: 'field-email-consent',
    },
    {
        key: 'smsMarketingConsent',
        label: 'Sms Marketing Consent',
        fieldDefinitions: SMS_CONSENT_FIELD_DEFINITIONS,
        dragType: 'field-sms-consent',
    },
    {
        key: 'addresses',
        label: 'Addresses',
        fieldDefinitions: ADDRESSES_FIELD_DEFINITIONS,
        dragType: 'field-addresses',
    },
]
