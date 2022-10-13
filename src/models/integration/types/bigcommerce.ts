import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

export type BigCommerceIntegration = IntegrationBase & {
    type: IntegrationType.BigCommerce
    meta: BigCommerceIntegrationMeta
}

export type BigCommerceIntegrationMeta = {
    oauth: OAuth2
    store_hash: string
    shop_display_name?: Maybe<string>
    sync_customer_notes?: boolean
    shop_domain?: Maybe<string>
    shop_phone?: string
    shop_id: number
    webhooks: Array<BigCommerceWebhook>
    shop_plan?: Maybe<string>
    import_state?: {
        customers: BigCommerceImportState
        products: BigCommerceImportState
        external_orders: BigCommerceImportState
    }
    need_scope_update?: boolean
    currency?: string
    available_currencies?: string[]
}

export type BigCommerceWebhook = {
    topic: string
    address: string
    webhook_id: number
}

type BigCommerceImportState = {
    is_over: boolean
    oldest_created_at: string
}
