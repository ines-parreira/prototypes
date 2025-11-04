import { isProduction, isStaging } from '@repo/utils'

import * as convert from '@gorgias/convert-client'
import * as ecommerceStorage from '@gorgias/ecommerce-storage-client'
import * as helpdesk from '@gorgias/helpdesk-client'
import * as knowledgeService from '@gorgias/knowledge-service-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import gorgiasAppsAuthInterceptor from 'utils/gorgiasAppsAuth'

export function initSDKs() {
    const KNOWLEDGE_SERVICE_BASE_URL = isProduction()
        ? `https://knowledge-service.gorgias.help`
        : isStaging()
          ? 'https://knowledge-service.gorgias.rehab'
          : `http://localhost:9500`

    helpdesk.setDefaultConfig({
        headers: {
            'X-CSRF-Token': window.CSRF_TOKEN,
            'X-Gorgias-User-Client': 'web',
        },
    })

    convert.setDefaultConfig({
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
        },
    })

    knowledgeService.setDefaultConfig({
        baseURL: KNOWLEDGE_SERVICE_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    convert.useRequestInterceptor(gorgiasAppsAuthInterceptor)
    ecommerceStorage.useRequestInterceptor(gorgiasAppsAuthInterceptor)
    knowledgeService.useRequestInterceptor(gorgiasAppsAuthInterceptor)
}
