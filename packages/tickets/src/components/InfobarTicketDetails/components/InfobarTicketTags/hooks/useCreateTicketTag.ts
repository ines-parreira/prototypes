import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { TicketTag } from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useCreateTag as useCreateTagPrimitive,
} from '@gorgias/helpdesk-queries'

type TagsQueryKeyParams = {
    queryParams: {
        search: string
    }
}

export function useCreateTicketTag() {
    const queryClient = useQueryClient()

    const { mutateAsync: createTagMutation, isLoading: isCreating } =
        useCreateTagPrimitive()

    const createTicketTag = useCallback(
        async (input: string) => {
            const response = await createTagMutation({
                data: { name: input.trim() },
            })

            const createdTag: TicketTag = {
                id: response.data.id,
                name: response.data.name,
                decoration: response.data.decoration,
            }

            void queryClient.invalidateQueries({
                predicate: ({ queryKey }) => {
                    const base = queryKeys.tags.listTags()
                    if (queryKey[0] !== base[0] || queryKey[1] !== base[1]) {
                        return false
                    }

                    const params = queryKey[2] as TagsQueryKeyParams | undefined
                    const searchParam = params?.queryParams?.search ?? ''

                    const normalizedInput = input.toLowerCase()
                    const normalizedSearch = searchParam.toLowerCase()

                    // Clear all tags queries that could have matched the newly created tag
                    return normalizedInput.includes(normalizedSearch)
                },
            })
            return createdTag
        },
        [queryClient, createTagMutation],
    )

    return { createTicketTag, isCreating }
}
