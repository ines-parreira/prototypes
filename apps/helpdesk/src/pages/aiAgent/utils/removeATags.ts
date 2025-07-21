export const removeATags = (content: string): string => {
    return content.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
}
