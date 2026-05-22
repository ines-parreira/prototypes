import client from '@repo/api-resources'
import { useMutation } from '@tanstack/react-query'

import type { RcsContext } from 'AIJourney/types/RcsTestSend'

export type {
    RcsButton,
    RcsContext,
    RcsProduct,
} from 'AIJourney/types/RcsTestSend'

type RcsTestSendRequest = {
    integration_id: number
    recipient_phone: string
    dry_run?: boolean
    rcs_context: RcsContext
}

export type RcsTestSendResponse = {
    content_sid: string | null
    template_name: string | null
    variables: Record<string, unknown> | null
    message_classification: 'text_only' | 'text_with_media' | 'rich_content'
    resolution_path: 'exact' | 'fallback' | 'text_degradation' | 'none'
    twilio_message_sid: string | null
    warnings: string[]
    templates_in_pool: number | null
}

const sendRcsTest = async (
    body: RcsTestSendRequest,
): Promise<RcsTestSendResponse> => {
    const { data } = await client.post<RcsTestSendResponse>(
        '/api/convert/rcs/test-send/',
        body,
    )
    return data
}

export const useRcsTestSend = () => useMutation({ mutationFn: sendRcsTest })
