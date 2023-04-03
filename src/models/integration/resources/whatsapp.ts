import {
    WhatsAppMigrationProgress,
    WhatsAppCodeVerificationMethod,
} from 'models/integration/types'
import client from '../../api/resources'

export const getMigrationProgress = async ({
    phone_number,
    waba_id,
}: {
    phone_number: string
    waba_id: string
}): Promise<WhatsAppMigrationProgress> => {
    const res = await client.get<WhatsAppMigrationProgress>(
        `/integrations/whatsapp/migration-progress?phone_number=${phone_number}&waba_id=${waba_id}`
    )
    return res.data
}

export const startMigration = async (payload: {
    phone_number: string
    waba_id: string
}): Promise<string> => {
    const res = await client.post<{waba_phone_number_id: string}>(
        `/integrations/whatsapp/migrate`,
        payload
    )
    return res.data?.waba_phone_number_id
}

export const requestVerificationCode = async (payload: {
    waba_phone_number_id: string
    code_method: WhatsAppCodeVerificationMethod
}): Promise<void> => {
    await client.post(`/integrations/whatsapp/request-code`, payload)
}

export const validateVerificationCode = async (payload: {
    waba_phone_number_id: string
    code: string
}): Promise<void> => {
    await client.post(`/integrations/whatsapp/verify-code`, payload)
}

export type WhatsAppRegistrationPayload = {
    waba_phone_number_id: string
    waba_id: string
}

export const registerNumber = async (
    payload: WhatsAppRegistrationPayload
): Promise<void> => {
    await client.post(`/integrations/whatsapp/register`, payload)
}
