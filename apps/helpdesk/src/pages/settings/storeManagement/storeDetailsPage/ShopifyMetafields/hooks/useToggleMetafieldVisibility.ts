import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Field } from '../MetafieldsTable/types'
import { METAFIELDS_QUERY_KEY } from './useMetafields'

type ToggleMetafieldVisibilityParams = {
    id: string
    isVisible: boolean
}

export function useToggleMetafieldVisibility() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: ToggleMetafieldVisibilityParams) => {
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
                return old.map((field) =>
                    field.id === params.id
                        ? { ...field, isVisible: params.isVisible }
                        : field,
                )
            })

            return { previousData }
        },
        //TODO: reset ui on error
    })
}
