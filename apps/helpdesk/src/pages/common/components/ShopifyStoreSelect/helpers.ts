import { fromJS, List, Map } from 'immutable'

import { Integration, IntegrationType } from '@gorgias/helpdesk-queries'

export interface IntegrationWithDefaultFlag {
    integration_id: number
    integration_type: IntegrationType
    integration_name: string
    has_customer_data: boolean
    default: boolean
}

export function normalizeIntegrationsWithDefaultFlagResponse(
    integrations: IntegrationWithDefaultFlag[],
) {
    return integrations?.map((integration) => ({
        id: integration.integration_id,
        name: integration.integration_name,
        type: integration.integration_type,
        hasCustomerData: integration.has_customer_data,
        default: integration.default,
    })) as unknown as Integration[]
}

export function getDefaultStore(integrations: List<Map<any, any>>): number {
    const defaultStore = integrations?.find(
        (integration) => !!integration?.get('default'),
    )
    return defaultStore?.get('id') || integrations?.first()?.get('id')
}

export const selectNormalizedIntegrations = (data: Record<string, any>) => {
    return fromJS(
        normalizeIntegrationsWithDefaultFlagResponse(
            (data?.data
                ?.integrations as unknown as IntegrationWithDefaultFlag[]) ??
                [],
        ),
    )
}
