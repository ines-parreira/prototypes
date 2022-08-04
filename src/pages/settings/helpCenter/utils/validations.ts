const subdomainRegex = '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$'

const isEmpty = (value: string) => value === ''

const isInvalid = (value: string) => !new RegExp(subdomainRegex).test(value)

export const isValidSubdomain = (value: string): boolean =>
    !isEmpty(value) && !isInvalid(value)

export const getSubdomainValidationError = (
    subdomain: string,
    isAvailable: boolean
): string | null => {
    // If subdomain is empty
    if (isEmpty(subdomain)) return 'Subdomain cannot be empty'

    // If subdomain is not valid
    if (isInvalid(subdomain))
        return 'Subdomain is invalid or contains forbidden keywords'

    // If subdomain is not available
    if (!isAvailable) return 'This Help Center subdomain is not available'

    return null
}

export const getNameValidationError = (name: string): string | null => {
    return name.length < 2 ? 'Name should be at least 2 characters long' : null
}
