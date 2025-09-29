import { FeatureFlagKey } from '@repo/feature-flags'
import { z } from 'zod'

import { useFlag } from 'core/flags'
import { Meta, SmartFollowUp, SmartFollowUpType } from 'models/ticket/types'

const isSmartFollowUpsMeta = (
    value: unknown,
): value is Pick<
    Meta,
    'smart_follow_ups' | 'selected_smart_follow_up_index'
> => {
    return z
        .object({
            smart_follow_ups: z
                .array(
                    z.object({
                        text: z.string(),
                        type: z.nativeEnum(SmartFollowUpType),
                    }),
                )
                .optional(),
            selected_smart_follow_up_index: z.number().optional(),
        })
        .safeParse(value).success
}

export const useSmartFollowUps = (
    ticketMessageMetadata: unknown,
): {
    shouldRenderMessageContent: boolean
    shouldRenderSmartFollowUps: boolean
    smartFollowUps: SmartFollowUp[]
    selectedSmartFollowUpIndex?: number
} => {
    const smartFollowUpsEnabled = useFlag(FeatureFlagKey.SmartFollowUps)

    if (
        !smartFollowUpsEnabled ||
        !isSmartFollowUpsMeta(ticketMessageMetadata)
    ) {
        return {
            shouldRenderMessageContent: true,
            shouldRenderSmartFollowUps: false,
            smartFollowUps: [],
        }
    }

    const smartFollowUps = ticketMessageMetadata.smart_follow_ups ?? []
    const selectedSmartFollowUpIndex =
        ticketMessageMetadata.selected_smart_follow_up_index

    const hasSelectedSmartFollowUp =
        selectedSmartFollowUpIndex !== undefined &&
        !!smartFollowUps[selectedSmartFollowUpIndex]

    const shouldRenderSmartFollowUps = smartFollowUps.length > 0

    return {
        // Message content should be shown in case smart follow ups should not be rendered, or in case when no smart follow ups have been selected.
        shouldRenderMessageContent:
            !shouldRenderSmartFollowUps || !hasSelectedSmartFollowUp,
        shouldRenderSmartFollowUps,
        smartFollowUps,
        selectedSmartFollowUpIndex,
    }
}
