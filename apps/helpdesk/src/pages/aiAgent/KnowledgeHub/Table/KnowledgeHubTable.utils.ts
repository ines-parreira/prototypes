import type { SortingState } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import {
    KnowledgeType as KnowledgeTypeEnum,
    KnowledgeVisibility,
} from '../types'

/**
 * Sorts knowledge items based on sorting state
 * Handles special cases for dates, booleans (inUseByAI), and nested properties
 */
export const sortData = (
    data: GroupedKnowledgeItem[],
    sorting: SortingState,
): GroupedKnowledgeItem[] => {
    if (sorting.length === 0) {
        return data // No sorting applied
    }

    const { id: sortKey, desc } = sorting[0]
    return [...data].sort((a, b) => {
        let aValue: any
        let bValue: any

        // Handle nested properties (e.g., 'metrics.tickets')
        if (sortKey.includes('.')) {
            const keys = sortKey.split('.')
            aValue = keys.reduce((obj, key) => obj?.[key], a as any)
            bValue = keys.reduce((obj, key) => obj?.[key], b as any)
        } else {
            aValue = a[sortKey as keyof GroupedKnowledgeItem]
            bValue = b[sortKey as keyof GroupedKnowledgeItem]
        }

        // Handle null/undefined (push to end)
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return 1
        if (bValue == null) return -1

        // Special handling for date columns
        if (sortKey === 'lastUpdatedAt') {
            const aDate = new Date(aValue).getTime()
            const bDate = new Date(bValue).getTime()

            if (isNaN(aDate) && isNaN(bDate)) return 0
            if (isNaN(aDate)) return 1
            if (isNaN(bDate)) return -1

            return desc ? bDate - aDate : aDate - bDate
        }

        // Special handling for boolean columns (inUseByAI)
        if (sortKey === 'inUseByAI') {
            const aInUse =
                a.type === KnowledgeTypeEnum.FAQ ||
                a.type === KnowledgeTypeEnum.Guidance
                    ? !!a.publishedVersionId &&
                      aValue === KnowledgeVisibility.PUBLIC
                    : aValue === KnowledgeVisibility.PUBLIC

            const bInUse =
                b.type === KnowledgeTypeEnum.FAQ ||
                b.type === KnowledgeTypeEnum.Guidance
                    ? !!b.publishedVersionId &&
                      bValue === KnowledgeVisibility.PUBLIC
                    : bValue === KnowledgeVisibility.PUBLIC

            if (aInUse === bInUse) return 0
            return desc ? (bInUse ? -1 : 1) : bInUse ? 1 : -1
        }

        // String comparison (case-insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue
                .toLowerCase()
                .localeCompare(bValue.toLowerCase())
            const result = desc ? -comparison : comparison

            return result
        }

        // Number comparison
        if (aValue < bValue) return desc ? 1 : -1
        if (aValue > bValue) return desc ? -1 : 1
        return 0
    })
}

/**
 * Maintains stable row order by preserving cached positions
 * New items are appended, deleted items are filtered out
 */
export const applyStableRowOrder = (
    data: GroupedKnowledgeItem[],
    sortedIds: string[],
): GroupedKnowledgeItem[] => {
    const dataMap = new Map<string, GroupedKnowledgeItem>()
    data.forEach((item) => {
        dataMap.set(String(item.id), item)
    })

    const orderedItems: GroupedKnowledgeItem[] = []
    sortedIds.forEach((id) => {
        const item = dataMap.get(id)
        if (item) {
            orderedItems.push(item)
            dataMap.delete(id)
        }
    })

    const unmappedItems: GroupedKnowledgeItem[] = []
    dataMap.forEach((item) => {
        unmappedItems.push(item)
    })

    return [...orderedItems, ...unmappedItems]
}
