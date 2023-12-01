import {stringify} from 'qs'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {
    WhatsAppMessageTemplate,
    ListWhatsAppMessageTemplatesParams,
} from './types'

export async function listWhatsAppMessageTemplates(
    params?: ListWhatsAppMessageTemplatesParams
): Promise<ApiListResponseCursorPagination<WhatsAppMessageTemplate[]>> {
    const response = await client.get<
        ApiListResponseCursorPagination<WhatsAppMessageTemplate[]>
    >('/integrations/whatsapp/message-templates', {
        params,
        paramsSerializer: (params) =>
            stringify(params, {arrayFormat: 'repeat'}),
    })
    return response.data
}
