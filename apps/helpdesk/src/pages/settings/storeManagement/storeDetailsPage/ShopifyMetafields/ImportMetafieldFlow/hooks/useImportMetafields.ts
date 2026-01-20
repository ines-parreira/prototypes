import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import {
    queryKeys,
    useUpdateMetafieldDefinition,
} from '@gorgias/helpdesk-queries'
import type { ListMetafieldDefinitionsResult } from '@gorgias/helpdesk-types'

import { transformMetafieldDefinitionToField } from '../../hooks/useMetafieldDefinitions'
import type { Field } from '../../MetafieldsTable/types'

export type ImportMetafieldsResult = {
    successful: Field[]
    failed: Field[]
}

type ImportMetafieldsParams = {
    fields: Field[]
}

export function useImportMetafields() {
    const { id } = useParams<{ id: string }>()
    const integrationId = Number(id)
    const queryClient = useQueryClient()
    const pinnedQueryKey = queryKeys.integrations.listMetafieldDefinitions(
        integrationId,
        { pinned: true },
    )

    const updateMutation = useUpdateMetafieldDefinition()

    return useMutation({
        mutationFn: async (
            params: ImportMetafieldsParams,
        ): Promise<ImportMetafieldsResult> => {
            const results = await Promise.allSettled(
                params.fields.map((field) =>
                    updateMutation.mutateAsync({
                        integrationId,
                        id: field.id,
                        data: { isPinned: true, isVisible: true },
                    }),
                ),
            )

            const successful = params.fields.filter(
                (_, index) => results[index].status === 'fulfilled',
            )
            const failed = params.fields.filter(
                (_, index) => results[index].status === 'rejected',
            )

            return { successful, failed }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: pinnedQueryKey })

            const previousResponse =
                queryClient.getQueryData<ListMetafieldDefinitionsResult>(
                    pinnedQueryKey,
                )
            const previousFields = (previousResponse?.data?.data ?? []).map(
                transformMetafieldDefinitionToField,
            )

            return { previousFields }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: pinnedQueryKey })
            queryClient.invalidateQueries({
                queryKey: queryKeys.integrations.listMetafieldDefinitions(
                    integrationId,
                    { pinned: false },
                ),
            })
        },
    })
}
