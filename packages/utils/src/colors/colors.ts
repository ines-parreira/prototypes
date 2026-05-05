export function isValidColor(value: string) {
    if (/^rgba?\(/i.test(value) && !isValidRgbColor(value)) {
        return false
    }

    const style = new Option().style
    style.color = value
    return !!style.color
}

function isValidRgbColor(value: string) {
    const match = value.match(/^rgba?\((.*)\)$/i)
    if (!match) return false

    const parts = match[1].split(',').map((part) => part.trim())
    if (parts.length < 3 || parts.length > 4) return false

    const [red, green, blue, alpha] = parts
    return (
        [red, green, blue].every(isRgbChannel) &&
        (alpha === undefined || isAlphaChannel(alpha))
    )
}

function isRgbChannel(value: string) {
    if (value.endsWith('%')) {
        const percentage = Number(value.slice(0, -1))
        return (
            Number.isFinite(percentage) && percentage >= 0 && percentage <= 100
        )
    }

    const channel = Number(value)
    return Number.isInteger(channel) && channel >= 0 && channel <= 255
}

function isAlphaChannel(value: string) {
    if (value.endsWith('%')) {
        const percentage = Number(value.slice(0, -1))
        return (
            Number.isFinite(percentage) && percentage >= 0 && percentage <= 100
        )
    }

    const alpha = Number(value)
    return Number.isFinite(alpha) && alpha >= 0 && alpha <= 1
}
