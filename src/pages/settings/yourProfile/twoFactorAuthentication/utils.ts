export function buildPasswordAnd2FaText(hasPassword: boolean) {
    let passwordAnd2FaText = 'Password & 2FA'

    if (!hasPassword) {
        passwordAnd2FaText = '2FA'
    }

    return passwordAnd2FaText
}

export function checkAccessTo2FAEnforcement(domain: string) {
    return (
        // allow access to 2FA enforcement for specified domains and for preview envs
        domain
            ? ['acme', 'test-martin', 'ionut-zamfir'].includes(domain) ||
                  domain.includes('.preview')
            : false
    )
}
