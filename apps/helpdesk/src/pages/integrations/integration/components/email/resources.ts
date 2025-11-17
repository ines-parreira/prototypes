import client from '../../../../../models/api/resources'
import type { ApiListResponseLegacyPagination } from '../../../../../models/api/types'
import type { EmailDomain } from '../../../../../models/integration/types'

export async function fetchEmailDomains(): Promise<EmailDomain[]> {
    const response = await client.get<
        ApiListResponseLegacyPagination<EmailDomain[]>
    >('/api/integrations/domains')
    return response.data.data
}
