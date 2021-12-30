import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

export type SelfServiceIntegration = IntegrationBase & {
    type: IntegrationType.SelfService
    meta: SelfServiceIntegrationMeta
}

export type SelfServiceIntegrationMeta = {
    shop_name: string
}
