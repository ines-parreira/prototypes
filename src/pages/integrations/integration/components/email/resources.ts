import client from '../../../../../models/api/resources'
import { ApiListResponseLegacyPagination } from '../../../../../models/api/types'
import { EmailDomain } from '../../../../../models/integration/types'

export async function fetchEmailDomains(): Promise<EmailDomain[]> {
    const response = await client.get<
        ApiListResponseLegacyPagination<EmailDomain[]>
    >('/api/integrations/domains')
    return response.data.data
}
