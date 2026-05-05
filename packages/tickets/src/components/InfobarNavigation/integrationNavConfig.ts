import { EditFieldsType, TicketInfobarTab } from '@repo/navigation'

import type { IconName } from '@gorgias/axiom'

export type IntegrationFlagKey =
    | 'hasShopify'
    | 'hasRecharge'
    | 'hasBigCommerce'
    | 'hasMagento'
    | 'hasWooCommerce'
    | 'hasSmile'
    | 'hasYotpo'
    | 'hasCustomIntegrations'

export type IntegrationFlags = Record<IntegrationFlagKey, boolean>

export type IntegrationNavConfig = {
    tab: TicketInfobarTab
    icon: IconName
    label: string
    menuLabel?: string
    editFieldsType: EditFieldsType
    flagKey: IntegrationFlagKey
}

export const INTEGRATION_NAV_CONFIG: readonly IntegrationNavConfig[] = [
    {
        tab: TicketInfobarTab.Shopify,
        icon: 'app-shopify',
        label: 'Shopify',
        editFieldsType: EditFieldsType.Shopify,
        flagKey: 'hasShopify',
    },
    {
        tab: TicketInfobarTab.Recharge,
        icon: 'app-recharge',
        label: 'Recharge',
        editFieldsType: EditFieldsType.Recharge,
        flagKey: 'hasRecharge',
    },
    {
        tab: TicketInfobarTab.BigCommerce,
        icon: 'app-bicommerce',
        label: 'BigCommerce',
        editFieldsType: EditFieldsType.Bigcommerce,
        flagKey: 'hasBigCommerce',
    },
    {
        tab: TicketInfobarTab.Magento,
        icon: 'app-magento',
        label: 'Magento',
        editFieldsType: EditFieldsType.Magento,
        flagKey: 'hasMagento',
    },
    {
        tab: TicketInfobarTab.WooCommerce,
        icon: 'app-woo',
        label: 'WooCommerce',
        editFieldsType: EditFieldsType.Woocommerce,
        flagKey: 'hasWooCommerce',
    },
    {
        tab: TicketInfobarTab.Smile,
        icon: 'app-smile',
        label: 'Smile',
        editFieldsType: EditFieldsType.Smile,
        flagKey: 'hasSmile',
    },
    {
        tab: TicketInfobarTab.Yotpo,
        icon: 'app-yotpo',
        label: 'Yotpo',
        editFieldsType: EditFieldsType.Yotpo,
        flagKey: 'hasYotpo',
    },
    {
        tab: TicketInfobarTab.CustomIntegrations,
        icon: 'webhook',
        label: 'Custom Integrations',
        menuLabel: 'Custom integrations',
        editFieldsType: EditFieldsType.Custom,
        flagKey: 'hasCustomIntegrations',
    },
]
