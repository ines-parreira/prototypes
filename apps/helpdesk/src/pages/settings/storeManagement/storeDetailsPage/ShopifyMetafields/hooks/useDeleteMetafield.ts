import {
    useIntegrationId,
    useMetafieldDefinitionMutation,
} from './useMetafieldDefinitionMutation'

type DeleteMetafieldParams = {
    id: string
}

export function useDeleteMetafield() {
    const integrationId = useIntegrationId()

    const mutation = useMetafieldDefinitionMutation({
        optimisticUpdate: (params, previousData) => {
            if (!previousData) return previousData
            return previousData.filter(
                (definition) => definition.id !== params.id,
            )
        },
    })

    return {
        ...mutation,
        mutate: (params: DeleteMetafieldParams) => {
            mutation.mutate({
                integrationId,
                id: params.id,
                data: { isPinned: false, isVisible: false },
            })
        },
    }
}
