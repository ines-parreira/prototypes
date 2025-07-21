export function splitStringUsingRegex(inputString: string): string[] {
    const characters: string[] = []
    const regex = /[\s\S]/gu

    let match
    while ((match = regex.exec(inputString)) !== null) {
        characters.push(match[0])
    }

    return characters
}

export const isNegative = (value: string): boolean => {
    return value.startsWith('-')
}

export const isZero = (value: string): boolean => {
    const numeric = parseFloat(value.replace(/^[+-]/, '').replace('%', ''))
    return numeric === 0
}
