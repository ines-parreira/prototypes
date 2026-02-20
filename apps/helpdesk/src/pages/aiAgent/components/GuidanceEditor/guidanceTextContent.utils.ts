export const textLimit = 30000

export const getPlainTextLength = (html: string): number => {
    if (!html) return 0
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent?.length ?? 0
}
