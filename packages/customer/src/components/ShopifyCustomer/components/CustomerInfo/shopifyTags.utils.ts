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
    existingTags: string[],
): TagOption[] {
    const options = (shopTags ?? []).map((tag) => ({
        id: tag,
        label: tag,
    }))

    if (
        search.trim() &&
        !options.some(
            (opt) => opt.label.toLowerCase() === search.toLowerCase(),
        ) &&
        !existingTags.some((tag) => tag.toLowerCase() === search.toLowerCase())
    ) {
        options.unshift({
            id: `__new__${search}`,
            label: `Add "${search}"`,
        })
    }

    return options
}
