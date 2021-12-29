import OpenAPIClientAxios, {Document} from 'openapi-client-axios'

import {isProduction, isStaging} from 'utils/environment'

import OpenAPIDoc from './help-center.openapi.json'
import {Client} from './client.generated'

export function getHelpCenterApiBaseUrl(): string {
    // Use helpdesk's host
    if (isStaging()) {
        return ''
    }
    if (isProduction()) {
        return 'https://internal-help-center-api.gorgias.com'
    }

    return 'http://acme.gorgias.docker:4001'
}

const api = new OpenAPIClientAxios({
    // We prefer having the OpenAPI doc locally rather
    // than fetching it at runtime.
    // Reason: the OpenAPI spec may change and it may mess the client
    // at runtime.
    definition: OpenAPIDoc as unknown as Document,
    ...(getHelpCenterApiBaseUrl()
        ? {withServer: {url: getHelpCenterApiBaseUrl()}}
        : {}),
})

const getHelpCenterClient = () => api.getClient<Client>()

export {getHelpCenterClient}
export type {Client as HelpCenterClient}
