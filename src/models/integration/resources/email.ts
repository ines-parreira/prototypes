import client from 'models/api/resources'
import {EmailMigrationBannerStatus} from '../types'

export const fetchEmailMigrationBannerStatus = async () => {
    const response = await client.get<EmailMigrationBannerStatus>(
        '/integrations/email/migration'
    )
    return response.data
}
