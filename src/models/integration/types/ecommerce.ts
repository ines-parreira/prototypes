import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import {Integration} from './index'

export type EcommerceIntegration = IntegrationBase & {
    type: IntegrationType.Ecommerce
    meta: EcommerceIntegrationMeta
}

export type EcommerceIntegrationMeta = {
    store_type: string
    store_uuid: string
}

export const isEcommerceIntegration = (
    integration: Maybe<Integration>
): integration is EcommerceIntegration =>
    integration?.type === IntegrationType.Ecommerce
