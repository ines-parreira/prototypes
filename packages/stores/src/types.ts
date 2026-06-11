import { IntegrationType } from '@gorgias/helpdesk-queries'
import type { Integration } from '@gorgias/helpdesk-queries'

export const STORE_INTEGRATION_TYPES = [
    IntegrationType.Shopify,
    IntegrationType.Bigcommerce,
    IntegrationType.Magento2,
] as const

type StoreIntegrationType = (typeof STORE_INTEGRATION_TYPES)[number]

export type StoreIntegration = Extract<
    Integration,
    { type: StoreIntegrationType }
>

export function isStoreIntegration(
    integration: Integration,
): integration is StoreIntegration {
    return (STORE_INTEGRATION_TYPES as readonly IntegrationType[]).includes(
        integration.type,
    )
}
