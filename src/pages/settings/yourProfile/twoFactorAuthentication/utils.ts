export function checkAccessTo2FA(domain: string) {
    return (
        // allow access to 2FA for specified domains and for preview envs
        domain
            ? ['acme', 'test-martin'].includes(domain) ||
                  domain.includes('.preview')
            : false
    )
}
