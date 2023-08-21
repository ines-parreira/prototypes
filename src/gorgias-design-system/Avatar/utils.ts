export function getInitials(
    name: string,
    useFirstInitialOnly?: boolean
): string {
    const splitName = name.split(' ').filter((text) => text.length > 0)

    if (splitName.length === 0) {
        // No valid name, return an empty string
        return ''
    }

    if (splitName.length === 1 || useFirstInitialOnly) {
        return splitName[0][0]
    }

    return `${splitName[0][0]}${splitName[1][0]}`
}
