export function buildPasswordAnd2FaText(hasPassword: boolean) {
    let passwordAnd2FaText = 'Password & 2FA'

    if (!hasPassword) {
        passwordAnd2FaText = '2FA'
    }

    return passwordAnd2FaText
}
