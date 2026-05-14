import client from '@repo/api-resources'
import { useMutation } from '@tanstack/react-query'

export type RcsButton = {
    type: string
    text: string
    value?: string
}

type RcsProduct = {
    title: string
    body?: string
    image: string
    product_id: number
    variant_id: number
    url?: string | null
}

type RcsTestSendRequest = {
    integration_id: number
    recipient_phone: string
    dry_run?: boolean
    rcs_context: {
        text: string
        title?: string
        images?: string[]
        buttons?: RcsButton[]
        products?: RcsProduct[]
    }
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
