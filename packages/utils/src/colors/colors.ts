export function isValidColor(value: string) {
    const style = new Option().style
    style.color = value
    return !!style.color
}
