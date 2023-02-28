import client from 'models/api/resources'
import {EmailMigration, EmailMigrationBannerStatus} from '../types'

export const startEmailMigration = async () => {
    const response = await client.post('/integrations/email/migration')
    return response
}

export const fetchMigrations = async () => {
    const response = await client.get<{data: EmailMigration[]}>(
        '/integrations/email/migration/integrations'
    )
    return response.data
}

export const fetchEmailMigrationBannerStatus = async () => {
    const response = await client.get<EmailMigrationBannerStatus>(
        '/integrations/email/migration'
    )
    return response.data
}

export const verifyMigrationIntegration = async (id: number) => {
    const response = await client.post<EmailMigration>(
        `/integrations/email/${id}/migration/verify`
    )
    return response.data
}
