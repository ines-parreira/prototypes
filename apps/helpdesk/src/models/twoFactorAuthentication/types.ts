export type AuthenticatorData = {
    secret_key: string
    account_name: string
    uri: string
}

export type RecoveryCode = {
    id: number
    code: string
    created_datetime: string
    used_datetime: Maybe<string>
}
