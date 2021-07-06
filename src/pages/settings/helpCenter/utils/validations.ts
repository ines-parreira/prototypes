export function isValidSubdomain(value: string) {
    if (value === '') {
        return false
    }

    const subdomainRegex = '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$'

    return new RegExp(subdomainRegex).test(value)
}
