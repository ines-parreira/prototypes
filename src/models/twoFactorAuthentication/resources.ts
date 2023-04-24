import client from '../api/resources'

import {AuthenticatorData, RecoveryCode} from './types'

export const fetchAuthenticatorData = async (
    renewed = false
): Promise<AuthenticatorData> => {
    const params = renewed ? {renewed} : {}

    const res = await client.get<AuthenticatorData>('/api/2fa/authenticator', {
        params,
    })
    return res.data
}
export const fetchAuthenticatorDataRenewed =
    async (): Promise<AuthenticatorData> => await fetchAuthenticatorData(true)

export const validateVerificationCode = async (
    verificationCode: string,
    existing = false
): Promise<void> => {
    const params: Record<string, any> = {}
    if (existing) {
        params['existing'] = existing
    }

    await client.get<void>(`/api/2fa/verification-code/${verificationCode}`, {
        params,
    })
}

export const saveTwoFASecret = async (): Promise<void> => {
    await client.post<void>('/api/2fa/secret', {})
}

export const deleteTwoFASecret = async (
    userId?: number,
    verificationCode?: string
): Promise<void> => {
    const params: Record<string, any> = {}

    if (userId) {
        params['user_id'] = userId
    }
    if (verificationCode) {
        params['verification_code'] = verificationCode
    }

    await client.delete<void>('/api/2fa/secret', {params})
}

export const createRecoveryCodes = async (
    renewed = false
): Promise<RecoveryCode[]> => {
    const data = renewed ? {renewed} : {}

    const res = await client.post<RecoveryCode[]>(
        '/api/2fa/recovery-codes',
        data
    )
    return res.data
}

export const renewRecoveryCodes = async (): Promise<RecoveryCode[]> =>
    await createRecoveryCodes(true)
