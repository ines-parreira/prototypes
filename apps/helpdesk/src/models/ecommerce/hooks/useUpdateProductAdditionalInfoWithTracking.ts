import { useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { contentStateFromTextOrHTML } from 'utils/editor'

import { useUpdateProductAdditionalInfo } from '../queries'
import type { UpdateProductAdditionalInfoParams } from '../queries'
import type { ProductAdditionalInfo } from '../types'

interface UseUpdateProductAdditionalInfoWithTrackingProps {
    integrationId: number
    initialValue?: ProductAdditionalInfo | null
    overrides?: Omit<
        UseMutationOptions<
            Awaited<
                ReturnType<typeof useUpdateProductAdditionalInfo>
            >['mutateAsync'] extends (...args: any) => Promise<infer R>
                ? R
                : never,
            AxiosError,
            UpdateProductAdditionalInfoParams
        >,
        'mutationFn'
    >
}

export const useUpdateProductAdditionalInfoWithTracking = ({
    integrationId,
    initialValue,
    overrides,
}: UseUpdateProductAdditionalInfoWithTrackingProps) => {
    const type = useMemo(() => {
        if (!initialValue?.rich_text) {
            return 'create'
        }
        // Check plain text length to handle empty editor states like <div><br /></div>
        const plainTextLength = contentStateFromTextOrHTML(
            '',
            initialValue.rich_text,
        ).getPlainText().length
        return plainTextLength > 0 ? 'update' : 'create'
    }, [initialValue])

    return useUpdateProductAdditionalInfo({
        ...overrides,
        onSuccess: (data, variables, context) => {
            const richText = variables.data.data.rich_text
            const plainTextLength = contentStateFromTextOrHTML(
                '',
                richText ?? '',
            ).getPlainText().length

            logEvent(SegmentEvent.AiAgentProductAdditionalInfoSaved, {
                integrationId,
                type,
                contentLengthFormattedText: richText?.length ?? 0,
                contentLengthPlainText: plainTextLength,
            })
            overrides?.onSuccess?.(data, variables, context)
        },
        onError: (error, variables, context) => {
            const richText = variables.data.data.rich_text
            const plainTextLength = contentStateFromTextOrHTML(
                '',
                richText,
            ).getPlainText().length

            logEvent(SegmentEvent.AiAgentProductAdditionalInfoSaveFailed, {
                integrationId,
                type,
                contentLengthFormattedText: richText?.length ?? 0,
                contentLengthPlainText: plainTextLength,
                errorCode: error.response?.status,
                errorMessage:
                    (error.response?.data as any)?.error?.msg || error.message,
            })
            overrides?.onError?.(error, variables, context)
        },
    })
}
