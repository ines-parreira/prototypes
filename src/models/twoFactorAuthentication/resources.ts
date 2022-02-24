import client from '../api/resources'

import {AuthenticatorData} from './types'

export const fetchAuthenticatorData = async (): Promise<AuthenticatorData> => {
    const res = await client.get<AuthenticatorData>('/api/2fa/authenticator')
    return res.data
}

export const validateVerificationCode = async (
    verificationCode: string
): Promise<void> => {
    await client.get<void>(`/api/2fa/verification-code/${verificationCode}`)
}
