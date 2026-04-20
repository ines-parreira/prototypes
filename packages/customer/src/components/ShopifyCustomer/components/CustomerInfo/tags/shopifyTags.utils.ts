import pluralize from 'pluralize'

export type TagOption = {
    id: string
    label: string
}

export function parseTags(tagsString: string | undefined): string[] {
    if (!tagsString || tagsString.trim() === '') {
        return []
    }
    return tagsString
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
}

export function tagsToString(tags: string[]): string {
    return tags.join(', ')
}

export function extractTagValues(selectedOptions: TagOption[]): string[] {
    const newTagValues = selectedOptions.map((opt) => {
        if (opt.id.startsWith('__new__')) {
            return opt.id.replace('__new__', '')
        }
        return opt.id
    })
    return [...new Set(newTagValues)]
}

export function formatTagCount(tagsString: string | undefined): string {
    const tags = parseTags(tagsString)
    if (tags.length === 0) return '-'
    return `(${tags.length} ${pluralize('tag', tags.length)})`
}

export function buildShopTagOptions(
    shopTags: string[] | undefined,
    search: string,
): TagOption[] {
    const searchLower = search.trim().toLowerCase()

    const filteredTags = searchLower
        ? (shopTags ?? []).filter((tag) =>
              tag.toLowerCase().includes(searchLower),
          )
        : (shopTags ?? [])

    return filteredTags.map((tag) => ({
        id: tag,
        label: tag,
    }))
}

export function canCreateTag(
    search: string,
    shopTags: string[] | undefined,
    existingTags: string[],
): boolean {
    const searchTrimmed = search.trim()
    if (!searchTrimmed) return false

    const searchLower = searchTrimmed.toLowerCase()
    const shopTagsLower = new Set((shopTags ?? []).map((t) => t.toLowerCase()))
    const existingTagsLower = new Set(existingTags.map((t) => t.toLowerCase()))

    return (
        !shopTagsLower.has(searchLower) && !existingTagsLower.has(searchLower)
    )
}

export function deduplicateTagIds(selectedOptions: TagOption[]): string[] {
    return [...new Set(selectedOptions.map((opt) => opt.id))]
}

export function addTagToList(existingTags: string[], newTag: string): string[] {
    return [...new Set([...existingTags, newTag])]
}

export function removeTagFromList(
    existingTags: string[],
    tagToRemove: string,
): string[] {
    return existingTags.filter((tag) => tag !== tagToRemove)
}
