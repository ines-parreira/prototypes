import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Field } from '../MetafieldsTable/types'
import { METAFIELDS_QUERY_KEY } from './useMetafields'

type DeleteMetafieldParams = {
    id: string
}

export function useDeleteMetafield() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: DeleteMetafieldParams) => {
            return params
        },
        onMutate: async (params) => {
            await queryClient.cancelQueries({
                queryKey: METAFIELDS_QUERY_KEY,
            })

            const previousData =
                queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)

            queryClient.setQueryData<Field[]>(METAFIELDS_QUERY_KEY, (old) => {
                if (!old) return old
                return old.filter((field) => field.id !== params.id)
            })

            return { previousData }
        },
        //TODO: reset ui on error
    })
}
