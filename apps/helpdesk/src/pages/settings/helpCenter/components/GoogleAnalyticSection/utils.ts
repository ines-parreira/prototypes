export const GOOGLE_ANALYTICS_ID_REGEXP = new RegExp('^(UA|G)-[A-Z0-9].*$')

export const isValidGaid = (value: string) => {
    return GOOGLE_ANALYTICS_ID_REGEXP.test(value)
}
