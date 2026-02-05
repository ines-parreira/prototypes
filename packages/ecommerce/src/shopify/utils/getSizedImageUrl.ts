export function getSizedImageUrl(src: string, size: string): string | null {
    const match = src.match(
        /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp)(\?v=\d+)?$/i,
    )

    if (match) {
        const prefix = src.split(match[0])
        const suffix = match[0]

        return `${prefix[0]}_${size}${suffix}`.replace(/http(s)?:/, '')
    }
    return null
}
