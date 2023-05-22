export const normalizeLocale = (locale: string): string => {
    return locale.replace('_', '-').toLowerCase()
}
