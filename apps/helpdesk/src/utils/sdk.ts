import { gorgiasAppsAuthInterceptor } from '@repo/api-resources'
import { GorgiasAppAuthService } from '@repo/api-resources/gorgiasAppsAuth'
import { isLocalDev, isProduction, isStaging } from '@repo/utils'

import * as convert from '@gorgias/convert-client'
import { GorgiasCopilotAgent } from '@gorgias/copilot'
import type { FetchCopilotShops } from '@gorgias/copilot'
import * as copilot from '@gorgias/copilot-client'
import * as customerSegmentation from '@gorgias/customer-segmentation-client'
import * as ecommerceStorage from '@gorgias/ecommerce-storage-client'
import * as helpdesk from '@gorgias/helpdesk-client'
import * as knowledgeService from '@gorgias/knowledge-service-client'
import * as workflows from '@gorgias/workflows-client'

import { getStoresConfigurations } from 'models/aiAgent/resources/configuration'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const COPILOT_API_PATH = '/api/copilot'

const copilotAuthService = new GorgiasAppAuthService({ client: 'copilot' })

/**
 * Mirrors `gorgiasAppsAuthInterceptor` but scoped to the `client: 'copilot'`
 * Gorgias apps token, so `@gorgias/copilot-client` and the agent share one
 * copilot-scoped auth source.
 */
export const copilotAppsAuthInterceptor: NonNullable<
    Parameters<typeof copilot.useRequestInterceptor>[0]
> = async (config) => {
    config.headers.setAuthorization(await copilotAuthService.getAccessToken())
    return config
}

export function getCopilotApiBaseUrl(): string {
    if (isProduction()) return 'https://copilot.gorgias.help/api/copilot'
    if (isStaging()) return 'https://copilot.gorgias.rehab/api/copilot'
    if (isLocalDev()) return 'https://copilot.gorgias.localhost/api/copilot'
    return COPILOT_API_PATH
}

/**
 * `@gorgias/copilot-client` operation paths already include `/api/copilot`, so
 * the SDK `baseURL` points at the origin. A same-origin `/api/copilot`
 * collapses to an empty string, leaving axios to issue relative requests.
 */
function getCopilotClientBaseUrl(): string {
    const base = getCopilotApiBaseUrl().replace(/\/+$/, '')
    return base.endsWith(COPILOT_API_PATH)
        ? base.slice(0, -COPILOT_API_PATH.length)
        : base
}

function getWorkflowsApiBaseUrl(): string {
    if (isProduction()) {
        return 'https://api.gorgias.work'
    }
    if (isStaging()) {
        return 'https://api-staging.gorgias.work'
    }
    return 'http://localhost:3100'
}

export function initSDKs() {
    const KNOWLEDGE_SERVICE_BASE_URL = isProduction()
        ? `https://knowledge-service.gorgias.help`
        : isStaging()
          ? 'https://knowledge-service.gorgias.rehab'
          : isLocalDev()
            ? 'https://knowledge-service.gorgias.localhost'
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

    copilot.setDefaultConfig({
        baseURL: getCopilotClientBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
        },
    })

    workflows.setDefaultConfig({
        baseURL: getWorkflowsApiBaseUrl(),
        headers: {
            'Content-Type': 'application/json',
        },
    })

    convert.useRequestInterceptor(gorgiasAppsAuthInterceptor)
    customerSegmentation.useRequestInterceptor(gorgiasAppsAuthInterceptor)
    ecommerceStorage.useRequestInterceptor(gorgiasAppsAuthInterceptor)
    knowledgeService.useRequestInterceptor(gorgiasAppsAuthInterceptor)
    copilot.useRequestInterceptor(copilotAppsAuthInterceptor)
    workflows.useRequestInterceptor(gorgiasAppsAuthInterceptor)
}

export function createCopilotAgent(): GorgiasCopilotAgent {
    return new GorgiasCopilotAgent({
        baseUrl: getCopilotApiBaseUrl(),
        getToken: () => copilotAuthService.getRawAccessToken(),
        onTokenInvalid: () => copilotAuthService.clearAccessToken(),
    })
}

export const fetchCopilotShops: FetchCopilotShops = async ({
    accountDomain,
}) => {
    const { storeConfigurations } = await getStoresConfigurations(
        accountDomain,
        { withWizard: false, withFloatingInput: false },
    )

    return storeConfigurations.map(({ storeName }) => ({
        name: storeName,
        label: storeName,
    }))
}
