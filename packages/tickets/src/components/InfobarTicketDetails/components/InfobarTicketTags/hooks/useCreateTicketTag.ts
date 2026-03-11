import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { TicketTag } from '@gorgias/helpdesk-queries'
import { useCreateTag as useCreateTagPrimitive } from '@gorgias/helpdesk-queries'

import { upsertTagIntoListTagsCache } from '../../../../../utils/optimisticUpdates/tagListCache'

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

            upsertTagIntoListTagsCache(queryClient, createdTag)
            return createdTag
        },
        [queryClient, createTagMutation],
    )

    return { createTicketTag, isCreating }
}
