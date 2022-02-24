import {AuthenticatorData} from '../models/twoFactorAuthentication/types'

export const authenticatorData = {
    secret_key: 'foo_secret',
    account_name: 'foo@email.com',
    uri: 'otpauth://foo-uri-authenticator',
} as AuthenticatorData
