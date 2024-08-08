const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('')

export const generateVariantName = (index: number) => {
    return `Variant ${alphabet[index]}`
}
