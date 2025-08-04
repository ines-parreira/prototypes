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

export const isValidPhoneNumber = (value?: string): boolean => {
    if (!value) return false

    const digits = value.replace(/\D/g, '')
    return digits.length === 10 && !value.includes('_')
}
