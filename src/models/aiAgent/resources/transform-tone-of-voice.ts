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
    const promises = []
    const chunkSize = 3
    for (let i = 0; i < conversations.length; i += chunkSize) {
        const chunk = conversations.slice(i, i + chunkSize)
        promises.push(
            apiClient.post<TransformToneOfVoiceResponse>(
                `/api/tov/transform-conversations`,
                {
                    tone_of_voice: toneOfVoice,
                    conversations: chunk,
                    product,
                },
                {
                    headers: {
                        'x-gorgias-domain': gorgiasDomain,
                    },
                },
            ),
        )
    }

    const responses = await Promise.all(promises)

    return responses.reduce((acc, response) => {
        acc.push(...response.data.conversations)
        return acc
    }, [] as TransformToneOfVoiceConversation[])
}
