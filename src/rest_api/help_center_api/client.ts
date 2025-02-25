import OpenAPIClientAxios, { Document } from 'openapi-client-axios'

import { AppAbility } from './ability'
import { Client } from './client.generated'
import OpenAPIDoc from './help-center.openapi.json'
import { getHelpCenterApiBaseUrl } from './utils'

export const helpCenterAPI = new OpenAPIClientAxios({
    // We prefer having the OpenAPI doc locally rather
    // than fetching it at runtime.
    // Reason: the OpenAPI spec may change and it may mess the client
    // at runtime.
    definition: OpenAPIDoc as unknown as Document,
    ...(getHelpCenterApiBaseUrl()
        ? { withServer: { url: getHelpCenterApiBaseUrl() } }
        : {}),
})

export type HelpCenterClient = Client & { ability?: AppAbility }
