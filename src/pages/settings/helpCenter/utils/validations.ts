import {FORBIDDEN_DOMAINS} from './forbiddenDomains'

const subdomainRegex = '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$'

const isEmpty = (value: string) => value === ''

const isInvalid = (value: string) => !new RegExp(subdomainRegex).test(value)

export const detectForbiddenDomain = (value: string): string | null => {
    const forbiddenDomain = FORBIDDEN_DOMAINS.find((domain) =>
        domain.test(value)
    )

    return forbiddenDomain
        ? forbiddenDomain.source
              .substring(1, forbiddenDomain.source.length - 1)
              .replace('.*', '')
        : null
}

export const isValidSubdomain = (value: string): boolean =>
    !isEmpty(value) && !isInvalid(value) && !detectForbiddenDomain(value)

export const getSubdomainValidationError = (
    subdomain: string,
    isAvailable: boolean
): string | null => {
    // If subdomain is empty
    if (isEmpty(subdomain)) return 'Subdomain cannot be empty'

    // If subdomain is not valid
    if (isInvalid(subdomain))
        return 'Subdomain is invalid or contains forbidden keywords'

    // If subdomain contains a forbidden domain
    const forbiddenDomain = detectForbiddenDomain(subdomain)

    if (forbiddenDomain) return `The keyword '${forbiddenDomain}' is forbidden`

    // If subdomain is not available
    if (!isAvailable) return 'This help center subdomain is already taken'

    return null
}
