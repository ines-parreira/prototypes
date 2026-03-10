import { formatCreatedAt } from './customerInfoFields.utils'
import type { FieldConfig } from './types'

export const SMS_CONSENT_FIELD_DEFINITIONS: Record<string, FieldConfig> = {
    state: {
        id: 'state',
        type: 'readonly',
        label: 'State',
        getValue: (ctx) =>
            ctx.smsMarketingConsent?.sms_marketing_consent?.state,
    },
    optInLevel: {
        id: 'optInLevel',
        type: 'readonly',
        label: 'Opt-in level',
        getValue: (ctx) =>
            ctx.smsMarketingConsent?.sms_marketing_consent?.opt_in_level,
    },
    consentUpdatedAt: {
        id: 'consentUpdatedAt',
        type: 'readonly',
        label: 'Consent updated at',
        getValue: (ctx) =>
            ctx.smsMarketingConsent?.sms_marketing_consent?.consent_updated_at,
        formatValue: (_, ctx) =>
            formatCreatedAt(
                ctx.smsMarketingConsent?.sms_marketing_consent
                    ?.consent_updated_at,
                ctx.dateFormat,
                ctx.timeFormat,
            ),
    },
}
