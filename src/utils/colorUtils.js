// from https://codepen.io/WebSeed/full/pvgqEq
function shouldFontBeDark(r, g, b) {
    // Counting the perceptive luminance
    // human eye favors green color...
    var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return (a < 0.5)
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

export function getFontColorFromBgColor(hexColor) {
    const rgb = hexToRgb(hexColor.replace('#', ''))

    if (!rgb) {
        return 'white'
    }

    const dark = shouldFontBeDark(rgb.r, rgb.g, rgb.b)

    return dark ? 'black' : 'white'
}
