import client from '../api/resources'

import {AuthenticatorData, RecoveryCode} from './types'

export const fetchAuthenticatorData = async (): Promise<AuthenticatorData> => {
    const res = await client.get<AuthenticatorData>('/api/2fa/authenticator')
    return res.data
}

export const validateVerificationCode = async (
    verificationCode: string
): Promise<void> => {
    await client.get<void>(`/api/2fa/verification-code/${verificationCode}`)
}

export const saveTwoFASecret = async (): Promise<void> => {
    await client.post<void>('/api/2fa/secret', {})
}

export const deleteTwoFASecret = async (userId?: number): Promise<void> => {
    let params = {}

    if (userId) {
        params = {
            user_id: userId,
        }
    }

    await client.delete<void>('/api/2fa/secret', {params})
}

export const createRecoveryCodes = async (): Promise<RecoveryCode[]> => {
    const res = await client.post<RecoveryCode[]>('/api/2fa/recovery-codes', {})
    return res.data
}
