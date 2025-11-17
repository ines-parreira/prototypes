import type { FormattedProductRecommendationRules } from './format-product-recommendation-rules'

export const getProductStatusData = (
    product: { id: string; tags?: string[]; vendor?: string; status?: string },
    type: 'promote' | 'exclude',
    rules: FormattedProductRecommendationRules,
) => {
    // Check if the product is draft
    if (product.status === 'draft') {
        return {
            badges: [
                {
                    label: 'Draft',
                    type: 'light-dark' as const,
                    tooltip: `This product’s status is Draft. It will automatically be ${type}d once its status changes to Active.`,
                },
            ],
            description: undefined,
        }
    }

    // If product is part of a product rule, no other rules apply
    if (rules[type].productIds.includes(product.id)) {
        return {
            badges: [],
            description: undefined,
        }
    }

    // Check if product is part of an opposite rule
    const oppositeRules = type === 'promote' ? rules.exclude : rules.promote

    const overrides: string[] = []
    if (oppositeRules.productIds.includes(product.id)) {
        overrides.push(
            `${type === 'promote' ? 'Excluded' : 'Promoted'} by product rule`,
        )
    }

    // Tag & vendor overrides only apply to promoted products, as exclusion precedes promotion
    if (type === 'promote') {
        for (const tag of product.tags || []) {
            if (oppositeRules.tags.includes(tag)) {
                overrides.push(`Excluded by tag rule on ${tag}`)
            }
        }

        if (product.vendor && oppositeRules.vendors.includes(product.vendor)) {
            overrides.push(`Excluded by vendor rule on ${product.vendor}`)
        }
    }

    if (overrides.length > 0) {
        return {
            badges: [
                {
                    label: type === 'promote' ? 'Excluded' : 'Promoted',
                    type:
                        type === 'promote'
                            ? ('light-error' as const)
                            : ('light-success' as const),
                },
            ],
            description: `${overrides[0]}${overrides.length > 1 ? ` +${overrides.length - 1} others` : ''}`,
        }
    }

    return {
        badges: [],
        description: undefined,
    }
}
