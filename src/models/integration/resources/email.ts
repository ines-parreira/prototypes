import client from 'models/api/resources'
import {
    EmailMigrationInboundVerification,
    EmailMigrationBannerStatus,
    EmailMigrationOutboundVerification,
    EmailDomain,
} from '../types'

type StartMigrationResponse = {
    forwarding_email_address: string
}

export const startEmailMigration = async () => {
    const response = await client.post<StartMigrationResponse>(
        '/integrations/email/migration'
    )
    return response.data
}

export const fetchMigrations = async () => {
    const response = await client.get<{
        data: EmailMigrationInboundVerification[]
    }>('/integrations/email/migration/integrations')
    return response.data
}

export const fetchEmailMigrationBannerStatus = async () => {
    const response = await client.get<EmailMigrationBannerStatus>(
        '/integrations/email/migration'
    )
    return response.data
}

export const verifyMigrationIntegration = async (id: number) => {
    const response = await client.post<EmailMigrationInboundVerification>(
        `/integrations/email/${id}/migration/verify`
    )
    return response.data
}

export const fetchMigrationDomains = async () => {
    const response = await client.get<{
        data: EmailMigrationOutboundVerification[]
    }>('/integrations/email/migration/domains')
    return response.data
}

export const createDomainVerification = async (
    domainName: string,
    dkimKeySize: number,
    provider?: string
) => {
    const params = provider ? `?provider=${provider}` : ''

    const response = await client.put<EmailDomain>(
        `/api/integrations/domains/${domainName}${params}`,
        {
            dkim_key_size: dkimKeySize,
        }
    )

    return response.data
}
