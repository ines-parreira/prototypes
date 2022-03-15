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

export const createRecoveryCodes = async (): Promise<RecoveryCode[]> => {
    const res = await client.post<RecoveryCode[]>('/api/2fa/recovery-codes', {})
    return res.data
}

export const deleteTwoFASecret = async (): Promise<void> => {
    await client.delete<void>('/api/2fa/secret')
}
