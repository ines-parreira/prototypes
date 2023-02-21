import client from 'models/api/resources'
import {EmailMigrationBannerStatus} from '../types'

export const startEmailMigration = async () => {
    const response = await client.post('/integrations/email/migration')
    return response
}

export const getEmailMigrations = async () => {
    // TODO
    await client.get<any>('/integrations/email/migration/integrations')
}

export const fetchEmailMigrationBannerStatus = async () => {
    const response = await client.get<EmailMigrationBannerStatus>(
        '/integrations/email/migration'
    )
    return response.data
}
