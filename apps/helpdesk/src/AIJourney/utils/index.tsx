import { isValidPhoneNumber as validatePhoneNumber } from 'libphonenumber-js'

export function splitStringUsingRegex(inputString: string): string[] {
    const characters: string[] = []
    const regex = /[\s\S]/gu

    let match
    while ((match = regex.exec(inputString)) !== null) {
        characters.push(match[0])
    }

    return characters
}

export const isValidPhoneNumber = (value?: string): boolean => {
    if (!value) {
        return false
    }

    try {
        return validatePhoneNumber(value)
    } catch {
        return false
    }
}

export const calculateRatiusToPercentage = ({
    numerator,
    denominator,
}: {
    numerator: number | undefined | null
    denominator: number | undefined | null
}): number => {
    if (numerator && denominator) {
        return (numerator / denominator) * 100
    }
    return 0
}

export const calculateRate = ({
    numerator,
    denominator,
}: {
    numerator: number | undefined | null
    denominator: number | undefined | null
}): number => {
    if (numerator && denominator) {
        return numerator / denominator
    }
    return 0
}
