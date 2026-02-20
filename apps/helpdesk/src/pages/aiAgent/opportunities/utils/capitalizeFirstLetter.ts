/**
 * Capitalizes the first letter of a string without changing the rest.
 * @param text - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export const capitalizeFirstLetter = (text: string): string => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
}
