import type { FieldConfig, FieldRenderContext } from '../types'
import { formatCreatedAt } from './formatCreatedAt'

type ConsentObject = {
    state?: string
    opt_in_level?: string
    consent_updated_at?: string
}

export function createMarketingConsentFields(
    getConsent: (ctx: FieldRenderContext) => ConsentObject | undefined,
): Record<string, FieldConfig> {
    return {
        state: {
            id: 'state',
            type: 'readonly',
            label: 'State',
            getValue: (ctx) => getConsent(ctx)?.state,
        },
        optInLevel: {
            id: 'optInLevel',
            type: 'readonly',
            label: 'Opt-in level',
            getValue: (ctx) => getConsent(ctx)?.opt_in_level,
        },
        consentUpdatedAt: {
            id: 'consentUpdatedAt',
            type: 'readonly',
            label: 'Consent updated at',
            getValue: (ctx) => getConsent(ctx)?.consent_updated_at,
            formatValue: (_, ctx) =>
                formatCreatedAt(
                    getConsent(ctx)?.consent_updated_at,
                    ctx.dateFormat,
                    ctx.timeFormat,
                ),
        },
    }
}
