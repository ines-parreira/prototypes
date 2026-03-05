import type { Moment } from 'moment-timezone'
import moment from 'moment-timezone'

import type {
    GroupedKnowledgeItem,
    KnowledgeItem,
} from 'pages/aiAgent/KnowledgeHub/types'
import {
    KnowledgeType,
    KnowledgeVisibility,
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

export const filterKnowledgeItemsByDateRange = (
    items: KnowledgeItem[],
    startDate: Moment | null,
    endDate: Moment | null,
): KnowledgeItem[] => {
    if (!startDate && !endDate) {
        return items
    }

    return items.filter((item) => {
        if (!item.lastUpdatedAt) {
            return true
        }

        const itemDate = moment(item.lastUpdatedAt)

        if (startDate && itemDate.isBefore(startDate, 'day')) {
            return false
        }

        if (endDate && itemDate.isAfter(endDate, 'day')) {
            return false
        }

        return true
    })
}

export const filterKnowledgeItemsByInUseByAI = (
    items: KnowledgeItem[],
    inUseByAIValue: boolean | null,
): KnowledgeItem[] => {
    if (inUseByAIValue === null) {
        return items
    }

    return items.filter((item) => {
        // For FAQ and Guidance articles, check both conditions:
        // 1. Article must have a published version (not only draft)
        // 2. Article must have public visibility
        let isInUse: boolean
        if (
            item.type === KnowledgeType.FAQ ||
            item.type === KnowledgeType.Guidance
        ) {
            isInUse =
                !!item.publishedVersionId &&
                item.inUseByAI === KnowledgeVisibility.PUBLIC
        } else {
            // For other types, use visibility status
            isInUse = item.inUseByAI === KnowledgeVisibility.PUBLIC
        }

        return inUseByAIValue ? isInUse : !isInUse
    })
}
