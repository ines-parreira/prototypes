import { useMutation, useQueryClient } from '@tanstack/react-query'

import { METAFIELDS_QUERY_KEY } from '../../hooks/useMetafields'
import type { Field } from '../../MetafieldsTable/types'

type ImportMetafieldsParams = {
    fields: Field[]
}

//TODO: replace after API is ready
export function useImportMetafields() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: ImportMetafieldsParams) => {
            return params
        },
        onMutate: async (params) => {
            await queryClient.cancelQueries({
                queryKey: METAFIELDS_QUERY_KEY,
            })

            const previousData =
                queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)

            queryClient.setQueryData<Field[]>(METAFIELDS_QUERY_KEY, (old) => {
                if (!old) return params.fields
                return [...old, ...params.fields]
            })

            return { previousData }
        },
    })
}
