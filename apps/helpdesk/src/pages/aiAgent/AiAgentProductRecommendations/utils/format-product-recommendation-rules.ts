import type {
    GetProductRecommendationRules,
    GetProductRecommendationRulesExcludedItem,
    GetProductRecommendationRulesPromotedItem,
} from '@gorgias/knowledge-service-client'

type FormattedProductRecommendationRulesType = {
    productIds: string[]
    tags: string[]
    vendors: string[]
    collectionIds: string[]
}

export type FormattedProductRecommendationRules = {
    promote: FormattedProductRecommendationRulesType
    exclude: FormattedProductRecommendationRulesType
}

const format = (
    rules:
        | GetProductRecommendationRulesPromotedItem[]
        | GetProductRecommendationRulesExcludedItem[],
): FormattedProductRecommendationRulesType => {
    const formatted: FormattedProductRecommendationRulesType = {
        productIds: [],
        tags: [],
        vendors: [],
        collectionIds: [],
    }

    for (const rule of rules) {
        if (rule.type === 'product') {
            formatted.productIds.push(...rule.items.map((item) => item.target))
        }

        if (rule.type === 'tag') {
            formatted.tags.push(...rule.items.map((item) => item.target))
        }

        if (rule.type === 'vendor') {
            formatted.vendors.push(...rule.items.map((item) => item.target))
        }

        if (rule.type === 'collection') {
            formatted.collectionIds.push(
                ...rule.items.map((item) => item.target),
            )
        }
    }

    return formatted
}

export const formatProductRecommendationRules = (
    rules?: GetProductRecommendationRules,
): FormattedProductRecommendationRules => ({
    promote: format(rules?.promoted ?? []),
    exclude: format(rules?.excluded ?? []),
})
