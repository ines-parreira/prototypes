import client from '../api/resources'
import type { AuthenticatorData, RecoveryCode } from './types'

export const fetchAuthenticatorData = async (
    renewed = false,
): Promise<AuthenticatorData> => {
    const params = renewed ? { renewed } : {}

    const res = await client.get<AuthenticatorData>('/api/2fa/authenticator', {
        params,
    })
    return res.data
}
export const fetchAuthenticatorDataRenewed =
    async (): Promise<AuthenticatorData> => await fetchAuthenticatorData(true)

export const validateVerificationCode = async (
    verificationCode: string,
    existing = false,
): Promise<void> => {
    const params: Record<string, any> = {}
    if (existing) {
        params['existing'] = existing
    }

    await client.post<void>(
        `/api/2fa/verification-code/${verificationCode}`,
        {},
        {
            params,
        },
    )
}

export const saveTwoFASecret = async (): Promise<void> => {
    await client.post<void>('/api/2fa/secret', {})
}

export const deleteTwoFASecret = async (
    userId?: number,
    verificationCode?: string,
    userPassword?: string,
): Promise<void> => {
    const params: Record<string, any> = {}

    if (userId) {
        params['user_id'] = userId
    }
    const data = {
        ...(userPassword && { user_password: userPassword }),
        ...(verificationCode && { verification_code: verificationCode }),
    }

    await client.post<void>('/api/2fa/secret/delete', data, { params })
}

export const createRecoveryCodes = async (
    renewed = false,
): Promise<RecoveryCode[]> => {
    const data = renewed ? { renewed } : {}

    const res = await client.post<RecoveryCode[]>(
        '/api/2fa/recovery-codes',
        data,
    )
    return res.data
}

export const renewRecoveryCodes = async (): Promise<RecoveryCode[]> =>
    await createRecoveryCodes(true)
