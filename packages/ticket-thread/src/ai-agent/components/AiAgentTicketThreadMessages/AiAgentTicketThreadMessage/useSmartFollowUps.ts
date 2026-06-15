import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useSearchParams } from '@repo/routing'
import { TicketSearchParamsKeys } from '@repo/tickets/utils/routing'
import { z } from 'zod'

const smartFollowUpSchema = z.object({
    text: z.string(),
    type: z.literal('dynamic_follow_up'),
})

const smartFollowUpsMetaSchema = z.object({
    smart_follow_ups: z.array(smartFollowUpSchema).optional(),
    selected_smart_follow_up_index: z.number().optional(),
})

export type SmartFollowUp = z.infer<typeof smartFollowUpSchema>

const { key: showTicketQuickRepliesKey, parse: parseShowTicketQuickReplies } =
    TicketSearchParamsKeys.showTicketQuickReplies

const defaultValue = {
    showAllSmartFollowUps: false,
    shouldRenderMessageContent: true,
    shouldRenderSmartFollowUps: false,
    smartFollowUps: [],
} satisfies {
    showAllSmartFollowUps: boolean
    shouldRenderMessageContent: boolean
    shouldRenderSmartFollowUps: boolean
    smartFollowUps: SmartFollowUp[]
    selectedSmartFollowUpIndex?: number
}

type UseSmartFollowUpsParams = {
    ticketMessageMetadata: unknown
}

export function useSmartFollowUps({
    ticketMessageMetadata,
}: UseSmartFollowUpsParams): {
    showAllSmartFollowUps: boolean
    shouldRenderMessageContent: boolean
    shouldRenderSmartFollowUps: boolean
    smartFollowUps: SmartFollowUp[]
    selectedSmartFollowUpIndex?: number
} {
    const smartFollowUpsEnabled = useFlag(FeatureFlagKey.SmartFollowUps)
    const [searchParams] = useSearchParams()
    const showAllSmartFollowUps = useMemo(
        () =>
            parseShowTicketQuickReplies(
                searchParams.get(showTicketQuickRepliesKey),
            ),
        [searchParams],
    )

    return useMemo(() => {
        if (!smartFollowUpsEnabled) {
            return defaultValue
        }

        const parsedMeta = smartFollowUpsMetaSchema.safeParse(
            ticketMessageMetadata,
        )

        if (!parsedMeta.success) {
            return defaultValue
        }

        const smartFollowUps = parsedMeta.data.smart_follow_ups ?? []
        const selectedSmartFollowUpIndex =
            parsedMeta.data.selected_smart_follow_up_index
        const hasSelectedSmartFollowUp =
            selectedSmartFollowUpIndex !== undefined &&
            !!smartFollowUps[selectedSmartFollowUpIndex]
        const shouldRenderSmartFollowUps = smartFollowUps.length > 0

        return {
            showAllSmartFollowUps,
            shouldRenderMessageContent:
                !shouldRenderSmartFollowUps || !hasSelectedSmartFollowUp,
            shouldRenderSmartFollowUps,
            smartFollowUps,
            selectedSmartFollowUpIndex,
        }
    }, [showAllSmartFollowUps, smartFollowUpsEnabled, ticketMessageMetadata])
}
