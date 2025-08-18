import { ProductRecommendationRuleType } from '../types'
import type {
    ProductConflictDetails,
    ProductRecommendationConflictError,
} from '../types/productRecommendationErrors'

const MAX_CONFLICTS_TO_DISPLAY = 3

function generateHint(
    conflictType: string,
    target?: string,
    ruleType?: ProductRecommendationRuleType,
): string {
    if (ruleType === 'product' && conflictType === 'product') {
        return ''
    }

    if (conflictType === 'product') {
        return ' (via product rule)'
    } else if (conflictType === 'tag') {
        return target ? ` (via tag "${target}")` : ' (via tag rule)'
    } else if (conflictType === 'vendor') {
        return target ? ` (via vendor "${target}")` : ' (via vendor rule)'
    }
    return ''
}

function formatConflictItem(
    conflict: ProductConflictDetails,
    ruleType: ProductRecommendationRuleType,
): string {
    const { productName, productId } = conflict
    const displayName =
        productName ||
        (ruleType === 'product' ? 'Product' : `Product ID: ${productId}`)
    const action = conflict.conflicts[0]?.action || 'conflicted'
    const conflictType = conflict.conflicts[0]?.type
    const target = conflict.conflicts[0]?.items[0]?.target

    const hint = generateHint(conflictType, target, ruleType)

    return `${displayName} is already ${action}${hint}`
}

export function formatConflictMessage(
    conflictData: ProductRecommendationConflictError,
    ruleType: ProductRecommendationRuleType,
): string {
    const { productConflicts } = conflictData

    if (productConflicts.length === 0) {
        return 'Failed to save product recommendations due to conflicts.'
    }

    const totalConflicts = productConflicts.length
    const conflictsToShow = productConflicts.slice(0, MAX_CONFLICTS_TO_DISPLAY)
    const conflictMessages = conflictsToShow.map((conflict) =>
        formatConflictItem(conflict, ruleType),
    )

    const action = productConflicts[0]?.conflicts[0]?.action || 'conflicted'
    const messagePrefix =
        ruleType === 'product'
            ? 'Conflict found'
            : `Some products with this ${ruleType} are already ${action}`

    let message = `${messagePrefix}: ${conflictMessages.join(', ')}`

    if (totalConflicts > MAX_CONFLICTS_TO_DISPLAY) {
        const additionalCount = totalConflicts - MAX_CONFLICTS_TO_DISPLAY
        message += ` (+${additionalCount} more)`
    }

    return message
}
