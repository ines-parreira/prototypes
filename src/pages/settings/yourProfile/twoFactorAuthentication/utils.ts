export function checkAccessTo2FA(domain: string) {
    return (
        // allow access to 2FA for specified domains and for preview envs
        domain
            ? ['acme', 'test-martin'].includes(domain) ||
                  domain.includes('.preview')
            : false
    )
}

export function buildPasswordAnd2FaText(
    hasPassword: boolean,
    hasAccessTo2FA: boolean
) {
    let passwordAnd2FaText = 'Change password'
    if (hasPassword && hasAccessTo2FA) {
        passwordAnd2FaText = 'Password & 2FA'
    } else if (hasAccessTo2FA) {
        passwordAnd2FaText = '2FA'
    }

    return passwordAnd2FaText
}
