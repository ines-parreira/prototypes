export default function getCustomFieldIdFromObjectPath(path: string) {
    const regex = /\[(\d+)\]/
    const match = path.match(regex)

    if (!match) {
        return null
    }

    const customFieldId = match[1]
    return parseInt(customFieldId, 10)
}
