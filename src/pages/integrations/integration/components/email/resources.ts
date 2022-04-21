import client from '../../../../../models/api/resources'

import {EmailDomain} from '../../../../../models/integration/types'
import {ApiListResponsePagination} from '../../../../../models/api/types'

export async function fetchEmailDomains(): Promise<EmailDomain[]> {
    const response = await client.get<ApiListResponsePagination<EmailDomain[]>>(
        '/api/integrations/domains'
    )
    return response.data.data
}
