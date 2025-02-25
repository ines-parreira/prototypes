/**
 * This file is intended to provided mocked hooks while developing the PersonalityPreviewStep component.
 * We will remove these in favor of the real hooks once the component is integrated into the application.
 */
import { useEffect, useMemo, useState } from 'react'

import { PreviewId } from '../../PersonalityPreviewGroup/constants'
import { getConversationByPreviewId } from './conversationsExamples'

export const useFetchPersonalityPreviewChatScenario = (
    previewType?: string,
    previewId?: PreviewId,
) => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!previewType) {
            return
        }

        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [previewType, previewId])

    return useMemo(
        () => ({
            data: {
                messages: previewId
                    ? getConversationByPreviewId(previewId).messages
                    : [],
            },
            isLoading,
        }),
        [isLoading, previewId],
    )
}
