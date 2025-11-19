import type {
    GroupedKnowledgeItem,
    KnowledgeItem,
} from 'pages/aiAgent/KnowledgeHub/types'

export const groupKnowledgeItemsBySource = (
    items: KnowledgeItem[],
    shouldGroup: boolean = true,
): GroupedKnowledgeItem[] => {
    if (!shouldGroup) {
        return items as GroupedKnowledgeItem[]
    }

    const sourceGroups = new Map<string, KnowledgeItem[]>()
    const ungroupedItems: GroupedKnowledgeItem[] = []

    items.forEach((item) => {
        if (item.source) {
            const existing = sourceGroups.get(item.source) || []
            sourceGroups.set(item.source, [...existing, item])
        } else {
            ungroupedItems.push(item)
        }
    })

    const groupedItems: GroupedKnowledgeItem[] = []

    sourceGroups.forEach((groupItems, source) => {
        const mostRecentItem = groupItems.reduce((latest, current) =>
            new Date(current.lastUpdatedAt) > new Date(latest.lastUpdatedAt)
                ? current
                : latest,
        )

        groupedItems.push({
            ...mostRecentItem,
            title: source,
            isGrouped: true,
            itemCount: groupItems.length,
        })
    })

    return [...groupedItems, ...ungroupedItems]
}

export const filterKnowledgeItemsBySource = (
    items: GroupedKnowledgeItem[],
    source: string | undefined,
) => {
    if (!source) {
        return items
    }
    return items.filter((item) => item.source === source)
}

export const filterKnowledgeItemsBySearchTerm = (
    items: GroupedKnowledgeItem[],
    searchTerm: string,
) => {
    if (!searchTerm) {
        return items
    }

    return items.filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
}
