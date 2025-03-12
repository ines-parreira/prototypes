/**
 * This file is intended to provided mocked hooks while developing the PersonalityPreviewStep component.
 * We will remove these in favor of the real hooks once the component is integrated into the application.
 */
import { useMemo } from 'react'

import { PreviewId } from '../../PersonalityPreviewGroup/constants'
import { getConversationByPreviewId } from './conversationsExamples'

export const useFetchPersonalityPreviewChatScenario = (
    previewType?: string,
    previewId?: PreviewId,
) => {
    return useMemo(
        () => ({
            data: {
                messages:
                    previewId && previewType
                        ? getConversationByPreviewId(previewId).messages
                        : [],
            },
            isLoading: false,
        }),
        [previewType, previewId],
    )
}
