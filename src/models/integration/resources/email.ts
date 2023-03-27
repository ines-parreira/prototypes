import client from 'models/api/resources'
import {
    EmailMigrationInboundVerification,
    EmailMigrationBannerStatus,
    EmailMigrationOutboundVerification,
} from '../types'

export const startEmailMigration = async () => {
    const response = await client.post('/integrations/email/migration')
    return response
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
    const response = await client.get<EmailMigrationOutboundVerification[]>(
        '/integrations/email/migration/domains'
    )
    return response.data
}
