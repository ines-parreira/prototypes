import {Integration, IntegrationType} from 'models/integration/types'
import {IntegrationListItem} from 'state/integrations/types'

export function hasTwitterIntegrations(integrations: Integration[]) {
    return integrations.some(
        (integration) =>
            integration.type === IntegrationType.Twitter &&
            integration.deleted_datetime === null
    )
}

function hasSmoochInsideIntegrations(integrations: Integration[]) {
    return integrations.some(
        (integration) =>
            integration.type === IntegrationType.SmoochInside &&
            (integration.deactivated_datetime === null ||
                Boolean(integration.meta?.shopify_integration_ids?.length))
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
    integrations: Integration[],
    isWhatsAppEnabled: boolean
) {
    return integrationsListItems.filter((integration) => {
        if (
            integration.type === IntegrationType.SmoochInside &&
            !hasSmoochInsideIntegrations(integrations)
        ) {
            return false
        }

        if (
            integration.type === IntegrationType.Klaviyo &&
            !hasKlaviyoIntegrations(integrations)
        ) {
            return false
        }

        if (
            integration.type === IntegrationType.WhatsApp &&
            !isWhatsAppEnabled
        ) {
            return false
        }
        return true
    })
}
