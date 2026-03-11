import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import { queryKeys, useUpdateAccountSetting } from '@gorgias/helpdesk-queries'
import type { ListAccountSettings200 } from '@gorgias/helpdesk-types'

import type { ViewsVisibilityData } from '../types/views'

export function useUpdateDefaultViewsVisibility() {
    const queryClient = useQueryClient()
    const queryKey = queryKeys.account.listAccountSettings({
        type: 'views-visibility',
    })

    const { mutate: updateVisibility } = useUpdateAccountSetting({
        mutation: {
            onMutate: async (variables) => {
                await queryClient.cancelQueries({ queryKey })
                const previousData =
                    queryClient.getQueryData<ListAccountSettings200>(queryKey)
                queryClient.setQueryData(
                    queryKey,
                    (old: { data: ListAccountSettings200 } | undefined) => {
                        if (!old) return old
                        return {
                            ...old,
                            data: {
                                ...old.data,
                                data: old.data.data.map((setting) =>
                                    setting.type === 'views-visibility'
                                        ? {
                                              ...setting,
                                              data: variables.data
                                                  .data as ViewsVisibilityData,
                                          }
                                        : setting,
                                ),
                            },
                        }
                    },
                )
                return { previousData }
            },
            onError: (_error, _variables, context) => {
                queryClient.setQueryData(queryKey, context?.previousData)
                toast.error('Failed to update views visibility')
            },
            onSettled: () => {
                void queryClient.invalidateQueries({ queryKey })
            },
        },
    })

    return updateVisibility
}
