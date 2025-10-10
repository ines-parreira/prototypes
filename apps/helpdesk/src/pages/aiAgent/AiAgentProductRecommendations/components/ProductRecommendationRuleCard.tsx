import { useEffect, useState } from 'react'

import { Product } from 'constants/integrations/types/shopify'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'

import usePaginatedProductsByIds from '../hooks/usePaginatedProductsByIds'
import { FormattedProductRecommendationRules } from '../utils/format-product-recommendation-rules'
import { getRuleCardLabels } from '../utils/get-rule-card-labels'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const ProductRecommendationRuleCard = ({
    type,
    integrationId,
    rules,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    rules: FormattedProductRecommendationRules
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (productIds: string[]) => Promise<any>
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSeeAllDrawerOpen, setIsSeeAllDrawerOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)

    // Only load products when drawer is open
    useEffect(() => {
        if (!isDrawerOpen) {
            return
        }

        setIsEnabled(true)
    }, [isDrawerOpen])

    const {
        allProducts: allProductRules,
        products: productRules,
        isLoading: isLoadingProductRules,
        isFetching: isFetchingProductRules,
        currentPage: drawerCurrentPage,
        hasNextPage: drawerHasNextPage,
        hasPrevPage: drawerHasPrevPage,
        setSearchTerm: drawerSetSearchTerm,
        fetchPage: drawerFetchPage,
    } = usePaginatedProductsByIds({
        integrationId,
        productIds: rules[type].productIds,
        enabled: !isLoadingRules,
        fetchAll: true,
    })

    const isFetching = isFetchingRules || isFetchingProductRules

    const {
        itemsData: allProducts,
        isLoading: isLoadingAllProducts,
        setSearchTerm,
        fetchNext,
        fetchPrev,
        hasNextPage,
        hasPrevPage,
    } = usePaginatedProductIntegration({
        integrationId: integrationId,
        initialParams: { limit: 25 },
        enabled: !!integrationId && isEnabled,
    })

    const labels = getRuleCardLabels(type, 'products')

    const typeMap = {
        promote: {
            draftTooltip: {
                card: 'Draft products will be promoted only after they become Active. Until then, Shopping Assistant won’t mention this product.',
                drawer: 'This product’s status is Draft. You can select it to be promoted, but it will only be mentioned and promoted once its status changes to Active.',
            },
        },
        exclude: {
            draftTooltip: {
                card: 'This product’s status is Draft. It will automatically be excluded once its status changes to Active.',
                drawer: 'This product’s status is Draft. You can select it to be excluded and it will automatically be excluded once its status changes to Active.',
            },
        },
    }

    const mapProduct = (product: Product, location: 'card' | 'drawer') => ({
        id: product.id.toString(),
        title: product.title,
        img: product.image?.src,
        badges:
            product.status === 'draft'
                ? [
                      {
                          label: 'Draft',
                          type: 'light-dark' as const,
                          tooltip: typeMap[type].draftTooltip[location],
                      },
                  ]
                : [],
    })

    return (
        <div>
            <RecommendationRuleCard
                title={labels.title}
                description={labels.description}
                isLoading={isLoadingRules}
                disableActions={isFetching || isUpserting}
                hasImages={true}
                type={type}
                addButton={{
                    label: 'Select products',
                    onClick: () => {
                        setSearchTerm('')
                        setIsDrawerOpen(true)
                    },
                }}
                itemLabelSingular="product"
                itemLabelPlural="products"
                totalItems={rules[type].productIds.length}
                items={allProductRules.slice(0, 4).map((product) => {
                    const mapped = mapProduct(product, 'card')
                    return {
                        ...mapped,
                        badges:
                            mapped.badges.length > 0
                                ? mapped.badges
                                : [labels.badge],
                    }
                })}
                onDelete={(deletedProductId: string) =>
                    onUpsert(
                        rules[type].productIds.filter(
                            (productId) => productId !== deletedProductId,
                        ),
                    )
                }
                onSeeAllClick={() => {
                    drawerSetSearchTerm('')
                    drawerFetchPage(1)
                    setIsSeeAllDrawerOpen(true)
                }}
            />

            <ItemDrawer
                isOpen={isDrawerOpen}
                isLoading={isLoadingAllProducts}
                hasImages={true}
                title={labels.selectionDrawerTitle}
                itemLabelPlural="products"
                selectedItemIds={rules[type].productIds}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={onUpsert}
                items={allProducts.map((product) => {
                    const mapped = mapProduct(product, 'drawer')

                    return {
                        ...mapped,
                        badges:
                            mapped.badges.length > 0
                                ? mapped.badges
                                : rules[
                                        type === 'promote'
                                            ? 'exclude'
                                            : 'promote'
                                    ].productIds.includes(product.id.toString())
                                  ? [
                                        {
                                            label:
                                                type === 'promote'
                                                    ? 'Excluded'
                                                    : 'Promoted',
                                            type:
                                                type === 'promote'
                                                    ? 'light-error'
                                                    : 'light-success',
                                            tooltip: `Product is currently ${type === 'promote' ? 'excluded' : 'promoted'}. Select and save changes to modify status.`,
                                        },
                                    ]
                                  : [],
                    }
                })}
                pagination={{
                    hasNextPage,
                    hasPrevPage,
                    onNextClick: fetchNext,
                    onPrevClick: fetchPrev,
                }}
                onSearch={setSearchTerm}
            />

            <ItemDrawer
                title={labels.selectedDrawerTitle}
                itemLabelPlural="products"
                items={productRules.map((product) =>
                    mapProduct(product, 'drawer'),
                )}
                selectedItemIds={rules[type].productIds}
                isOpen={isSeeAllDrawerOpen}
                isLoading={isLoadingProductRules}
                hasImages={true}
                pagination={{
                    hasNextPage: drawerHasNextPage,
                    hasPrevPage: drawerHasPrevPage,
                    onNextClick: () => drawerFetchPage(drawerCurrentPage + 1),
                    onPrevClick: () => drawerFetchPage(drawerCurrentPage - 1),
                }}
                onClose={() => setIsSeeAllDrawerOpen(false)}
                onSubmit={onUpsert}
                onSearch={drawerSetSearchTerm}
            />
        </div>
    )
}
