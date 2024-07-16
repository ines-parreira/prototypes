import {stringify} from 'qs'
import client from 'models/api/resources'
import {
    EmailMigrationInboundVerification,
    EmailMigrationBannerStatus,
    EmailMigrationOutboundVerification,
    EmailDomain,
} from '../types'
import {EmailProvider} from '../constants'

type StartMigrationResponse = {
    forwarding_email_address: string
}

export type CreateDomainVerificationPayload = {
    domainName: string
    dkimKeySize?: number
    provider: string | EmailProvider
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
    payload: CreateDomainVerificationPayload
) => {
    const {domainName, dkimKeySize, provider} = payload
    const response = await client.put<EmailDomain>(
        `/api/integrations/domains/${domainName}`,
        {
            dkim_key_size: dkimKeySize,
            params: {provider},
            paramsSerializer: stringify,
        }
    )

    return response.data
}
