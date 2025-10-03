import { useEffect, useState } from 'react'

import { Product } from 'constants/integrations/types/shopify'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'

import usePaginatedProductsByIds from '../hooks/usePaginatedProductsByIds'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const ProductRecommendationRuleCard = ({
    type,
    integrationId,
    productIds,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    productIds: string[]
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
        productIds,
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

    const typeMap = {
        promote: {
            title: 'Promote products',
            description: 'Choose products to prioritize in recommendations.',
            badge: { label: '\u2605 Promoted', type: 'light-success' as const },
            selectionDrawerTitle: 'Select products to promote',
            selectedDrawerTitle: 'All promoted products',
        },
        exclude: {
            title: 'Exclude products',
            description: 'Choose products to exclude from recommendations.',
            badge: { label: 'Excluded', type: 'light-error' as const },
            selectionDrawerTitle: 'Select products to exclude',
            selectedDrawerTitle: 'All excluded products',
        },
    }

    const mapProducts = (products: Product[]) =>
        products.map((product) => ({
            id: product.id.toString(),
            title: product.title,
            img: product.image?.src,
            status: product.status,
        }))

    return (
        <div>
            <RecommendationRuleCard
                title={typeMap[type].title}
                description={typeMap[type].description}
                isLoading={isLoadingRules}
                disableActions={isFetching || isUpserting}
                hasImages={true}
                badge={typeMap[type].badge}
                type={type}
                addButton={{
                    label: 'Select products',
                    onClick: () => setIsDrawerOpen(true),
                }}
                itemLabelSingular="product"
                itemLabelPlural="products"
                totalItems={productIds.length}
                items={mapProducts(allProductRules.slice(0, 5))}
                onDelete={(deletedProductId: string) =>
                    onUpsert(
                        productIds.filter(
                            (productId) => productId !== deletedProductId,
                        ),
                    )
                }
                onSeeAllClick={() => setIsSeeAllDrawerOpen(true)}
            />

            <ItemDrawer
                isOpen={isDrawerOpen}
                isLoading={isLoadingAllProducts}
                hasImages={true}
                title={typeMap[type].selectionDrawerTitle}
                itemLabelPlural="products"
                selectedItemIds={productIds}
                type={type}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={onUpsert}
                items={mapProducts(allProducts)}
                pagination={{
                    hasNextPage,
                    hasPrevPage,
                    onNextClick: fetchNext,
                    onPrevClick: fetchPrev,
                }}
                onSearch={setSearchTerm}
            />

            <ItemDrawer
                title={typeMap[type].selectedDrawerTitle}
                itemLabelPlural="products"
                items={mapProducts(productRules)}
                selectedItemIds={productIds}
                isOpen={isSeeAllDrawerOpen}
                isLoading={isLoadingProductRules}
                hasImages={true}
                type={type}
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
