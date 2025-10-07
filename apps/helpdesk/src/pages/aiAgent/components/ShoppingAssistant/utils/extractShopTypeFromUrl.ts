/**
 * Extracts shop type from a URL following the pattern app/ai-agent/${shopType}/${shopName}/...
 * Works with any URL that contains this pattern, regardless of what comes before or after
 *
 * @param url - The URL to extract the shop type from (can be full URL or just path)
 * @returns The extracted shop type or undefined if not found
 */
export const extractShopTypeFromUrl = (url: string): string | undefined => {
    const path = url.includes('://') ? new URL(url).pathname : url
    const match = path.match(/\/app\/ai-agent\/([^\/]+)\/([^\/]+)/)
    return match ? match[1] : undefined
}
