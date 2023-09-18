// g/integrations/magento2/schemas.py
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import type {Integration} from './'

export type Magento2Integration = IntegrationBase & {
    type: IntegrationType.Magento2
    meta: Magento2IntegrationMeta
}

export type Magento2IntegrationMeta = {
    store_url: string
    admin_url_suffix?: string
    import_state: {
        is_over?: boolean
        oldest_created_at?: string
    }
    is_manual: boolean
}

export const isMagento2Integration = (
    integration: Maybe<Integration>
): integration is Magento2Integration =>
    integration?.type === IntegrationType.Magento2
