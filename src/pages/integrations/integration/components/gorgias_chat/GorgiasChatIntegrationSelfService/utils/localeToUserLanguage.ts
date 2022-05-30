export function localeToUserLanguage(locale: string): string {
    try {
        const intl = new Intl.DisplayNames(['en'], {type: 'language'})
        return intl.of(locale)
    } catch (err) {
        console.error(err)
        return locale
    }
}
