// g/integrations/shopify/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

import type {Integration} from './'

export type ShopifyIntegration = IntegrationBase & {
    type: IntegrationType.Shopify
    meta: ShopifyIntegrationMeta
}

export type ShopifyIntegrationMeta = {
    oauth: OAuth2
    shop_name: string
    shop_display_name?: Maybe<string>
    shop_domain?: Maybe<string>
    shop_id?: Maybe<number>
    shop_phone?: Maybe<string>
    shop_plan?: Maybe<string>
    uses_multi_currency?: boolean
    import_state?: {
        customers: ShopifyImportState
        products: ShopifyImportState
    }
    need_scope_update?: boolean
    is_used_for_billing?: boolean
    sync_customer_notes?: boolean
    currency?: string
    webhooks: string[]
}

type ShopifyImportState = {
    is_over: boolean
    oldest_created_at: string
}

export const isShopifyIntegration = createTypeGuard<
    Maybe<Integration>,
    ShopifyIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Shopify ? input : undefined
)
