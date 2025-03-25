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
) => {
    return await apiClient.post<TransformToneOfVoiceResponse>(
        `/api/tov/transform-conversations`,
        {
            tone_of_voice: toneOfVoice,
            conversations,
        },
        {
            headers: {
                'x-gorgias-domain': gorgiasDomain,
            },
        },
    )
}
