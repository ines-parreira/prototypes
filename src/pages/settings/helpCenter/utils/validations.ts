import {FORBIDDEN_DOMAINS} from './forbiddenDomains'

export const doesNotContainForbiddenWords = (subdomain: string): boolean =>
    !FORBIDDEN_DOMAINS.some((domain) => domain.test(subdomain))

export function isValidSubdomain(value: string) {
    if (value === '') {
        return false
    }

    const subdomainRegex = '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$'

    return (
        new RegExp(subdomainRegex).test(value) &&
        doesNotContainForbiddenWords(value)
    )
}
