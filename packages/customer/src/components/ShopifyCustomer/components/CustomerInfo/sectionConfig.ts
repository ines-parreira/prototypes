import { ADDRESSES_FIELD_DEFINITIONS } from './addressesFields'
import { DEFAULT_ADDRESS_FIELD_DEFINITIONS } from './defaultAddressFields'
import { EMAIL_CONSENT_FIELD_DEFINITIONS } from './emailMarketingConsentFields'
import { FIELD_DEFINITIONS } from './fields'
import { SMS_CONSENT_FIELD_DEFINITIONS } from './smsMarketingConsentFields'
import type { FieldConfig, SectionKey } from './types'

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
