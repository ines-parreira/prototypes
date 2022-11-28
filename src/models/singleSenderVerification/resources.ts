import client from 'models/api/resources'
import {SenderVerification, SenderInformation} from './types'

export const createVerification = async (
    id: number,
    senderInformation: SenderInformation
): Promise<SenderVerification> => {
    const res = await client.post<SenderVerification>(
        `/integrations/email/${id}/sender-verification`,
        senderInformation
    )
    return res.data
}

export const resendVerificationEmail = async (id: number): Promise<void> => {
    await client.post(
        `/integrations/email/${id}/sender-verification/send-email`
    )
}

export const getVerification = async (
    id: number
): Promise<SenderVerification> => {
    const res = await client.get<SenderVerification>(
        `/integrations/email/${id}/sender-verification`
    )
    return res.data
}

export const checkVerification = async (
    id: number
): Promise<SenderVerification> => {
    const res = await client.post<SenderVerification>(
        `/integrations/email/${id}/sender-verification/check`
    )
    return res.data
}

export const deleteVerification = async (id: number): Promise<void> => {
    await client.delete(`/integrations/email/${id}/sender-verification`)
}
