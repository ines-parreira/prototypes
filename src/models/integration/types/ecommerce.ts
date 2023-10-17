import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'

export type EcommerceIntegration = IntegrationBase & {
    type: IntegrationType.Ecommerce
    meta: EcommerceIntegrationMeta
}

export type EcommerceIntegrationMeta = {
    store_type: string
    store_uuid: string
}
