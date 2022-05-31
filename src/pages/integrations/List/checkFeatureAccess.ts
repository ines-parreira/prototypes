export function checkBigCommerceAccess(domain: string) {
    return (
        // allow access feature for specified domains and for preview envs
        domain
            ? ['acme', 'test-martin', 'manuel-testing'].includes(domain) ||
                  domain.includes('.preview')
            : false
    )
}
