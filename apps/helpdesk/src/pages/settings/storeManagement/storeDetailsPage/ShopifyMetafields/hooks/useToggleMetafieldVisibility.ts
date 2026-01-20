import {
    useIntegrationId,
    useMetafieldDefinitionMutation,
} from './useMetafieldDefinitionMutation'

type ToggleMetafieldVisibilityParams = {
    id: string
    isVisible: boolean
}

export function useToggleMetafieldVisibility() {
    const integrationId = useIntegrationId()

    const mutation = useMetafieldDefinitionMutation({
        optimisticUpdate: (params, previousData) => {
            if (!previousData) return previousData
            return previousData.map((definition) =>
                definition.id === params.id
                    ? { ...definition, isVisible: params.data.isVisible }
                    : definition,
            )
        },
    })

    const buildMutationParams = (params: ToggleMetafieldVisibilityParams) => ({
        integrationId,
        id: params.id,
        data: { isPinned: true, isVisible: params.isVisible },
    })

    return {
        ...mutation,
        mutate: (params: ToggleMetafieldVisibilityParams) => {
            mutation.mutate(buildMutationParams(params))
        },
    }
}
