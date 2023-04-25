import {Integration, IntegrationType} from 'models/integration/types'
import {IntegrationListItem} from 'state/integrations/types'

export function hasTwitterIntegrations(integrations: Integration[]) {
    return integrations.some(
        (integration) =>
            integration.type === IntegrationType.Twitter &&
            integration.deleted_datetime === null
    )
}

function hasKlaviyoIntegrations(integrations: Integration[]) {
    return integrations.some(
        (integration) =>
            integration.type === IntegrationType.Klaviyo &&
            integration.deleted_datetime === null
    )
}

export function filterOutDeprecatedIntegrations(
    integrationsListItems: IntegrationListItem[],
    integrations: Integration[]
) {
    return integrationsListItems.filter((integration) => {
        if (
            integration.type === IntegrationType.Klaviyo &&
            !hasKlaviyoIntegrations(integrations)
        ) {
            return false
        }
        if (
            integration.type === IntegrationType.Twitter &&
            !hasTwitterIntegrations(integrations)
        ) {
            return false
        }
        return true
    })
}
