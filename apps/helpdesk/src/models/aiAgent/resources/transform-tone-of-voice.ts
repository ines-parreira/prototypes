import {
    TransformToneOfVoiceConversation,
    TransformToneOfVoiceResponse,
} from '../types'
import { apiClient } from './message-processing'

/**
 * Endpoints "/api/tov/transform-conversations"
 */
export const transformToneOfVoice = async (
    gorgiasDomain: string,
    toneOfVoice: string,
    conversations: TransformToneOfVoiceConversation[],
    product?: { title: string; description: string },
) => {
    const response = await apiClient.post<TransformToneOfVoiceResponse>(
        `/api/tov/transform-conversations`,
        {
            tone_of_voice: toneOfVoice,
            conversations,
            product,
        },
        {
            headers: {
                'x-gorgias-domain': gorgiasDomain,
            },
        },
    )

    return response.data.conversations
}
