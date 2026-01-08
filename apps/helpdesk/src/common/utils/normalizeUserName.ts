export default function normalizeUserName(name: string): string {
    const withoutEmojis = name.trim().replace(/\p{Extended_Pictographic}/gu, '')
    const normalized = withoutEmojis.replace(/\s+/g, ' ')
    return normalized
}
