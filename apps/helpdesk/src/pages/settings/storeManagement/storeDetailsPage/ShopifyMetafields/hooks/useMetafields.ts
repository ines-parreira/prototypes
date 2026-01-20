import { useIntegrationId } from './useMetafieldDefinitionMutation'
import { useMetafieldDefinitions } from './useMetafieldDefinitions'

export function useMetafields() {
    const integrationId = useIntegrationId()

    return useMetafieldDefinitions({
        integrationId,
        pinned: true,
    })
}
