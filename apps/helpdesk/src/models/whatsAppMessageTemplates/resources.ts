import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'

import type {
    ListWhatsAppMessageTemplatesParams,
    WhatsAppMessageTemplate,
} from './types'

export async function listWhatsAppMessageTemplates(
    params?: ListWhatsAppMessageTemplatesParams,
): Promise<ApiListResponseCursorPagination<WhatsAppMessageTemplate[]>> {
    const response = await client.get<
        ApiListResponseCursorPagination<WhatsAppMessageTemplate[]>
    >('/integrations/whatsapp/message-templates', {
        params,
        paramsSerializer: {
            indexes: null,
        },
    })
    return response.data
}
