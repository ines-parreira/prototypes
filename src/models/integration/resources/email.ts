import client from 'models/api/resources'
import {EmailMigration, EmailMigrationBannerStatus} from '../types'

export const startEmailMigration = async () => {
    const response = await client.post('/integrations/email/migration')
    return response
}

export const fetchMigrations = async () => {
    // TODO
    return new Promise<{data: EmailMigration[]}>((res) => {
        res({
            data: [
                {
                    integration: {
                        id: 1,
                        meta: {
                            address: 'support@customer.com',
                            verified: true,
                            outbound_verification_status: {},
                        },
                    },
                    status: 'initiated',
                    last_verification_email_sent_at: '',
                },
            ] as unknown as EmailMigration[],
        })
    })
    // await client.get<any>('/integrations/email/migration/integrations')
}

export const fetchEmailMigrationBannerStatus = async () => {
    const response = await client.get<EmailMigrationBannerStatus>(
        '/integrations/email/migration'
    )
    return response.data
}
