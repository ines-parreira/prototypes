export function getMetafieldTitleLabel(namespace: string, key: string): string {
    const label = `${namespace} metafield: ${key}`

    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
}
