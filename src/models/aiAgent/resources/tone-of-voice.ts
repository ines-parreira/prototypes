import { ToneOfVoiceResponse } from '../types'
import { apiClient } from './message-processing'

/**
 * Endpoints "/tov/generate"
 */
export const generateToneOfVoice = async (
    gorgiasDomain: string,
    storeDomain: string,
) => {
    return await apiClient.post<ToneOfVoiceResponse>(
        `/api/tov/generate`,
        {
            url: storeDomain,
        },
        {
            headers: {
                'x-gorgias-domain': gorgiasDomain,
            },
        },
    )
}
