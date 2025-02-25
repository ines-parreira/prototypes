import { useMemo } from 'react'

import { z } from 'zod'

// ✅ Define the form values type
export type ChannelsFormValues = {
    emailChannelEnabled: boolean
    emailIntegrationIds: number[]
    chatChannelEnabled: boolean
    chatIntegrationIds: number[]
}

// ✅ Create a custom hook for the schema
export const useChannelsSchema = (createNewChat: boolean) => {
    return useMemo(
        () =>
            z
                .object({
                    emailChannelEnabled: z.boolean().optional(),
                    emailIntegrationIds: z.array(z.number()).optional(),
                    chatChannelEnabled: z.boolean().optional(),
                    chatIntegrationIds: z.array(z.number()).optional(),
                })
                .superRefine((data, ctx) => {
                    // ✅ Ensure at least one channel is enabled
                    if (!data.emailChannelEnabled && !data.chatChannelEnabled) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message:
                                'You must enable at least one channel (Email or Chat).',
                            path: ['emailChannelEnabled'],
                        })
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message:
                                'You must enable at least one channel (Email or Chat).',
                            path: ['chatChannelEnabled'],
                        })
                    }

                    // ✅ Require at least one email integration if email is enabled
                    if (
                        data.emailChannelEnabled &&
                        (!data.emailIntegrationIds ||
                            data.emailIntegrationIds.length === 0)
                    ) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message:
                                'You must select at least one email integration.',
                            path: ['emailIntegrationIds'],
                        })
                    }

                    // ✅ Require at least one chat integration if chat is enabled and `createNewChat` is false
                    if (
                        data.chatChannelEnabled &&
                        !createNewChat &&
                        (!data.chatIntegrationIds ||
                            data.chatIntegrationIds.length === 0)
                    ) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message:
                                'You must select at least one chat integration.',
                            path: ['chatIntegrationIds'],
                        })
                    }
                }),
        [createNewChat],
    )
}
