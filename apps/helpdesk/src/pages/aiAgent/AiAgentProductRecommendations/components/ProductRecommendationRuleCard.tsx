import { useEffect, useState } from 'react'

import { Product } from 'constants/integrations/types/shopify'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'

import { ItemSelectionDrawer } from './ItemSelectionDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'
import { SelectedItemsDrawer } from './SelectedItemsDrawer'

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
        data: selectedProducts = [],
        isLoading: isLoadingSelectedProducts,
        isFetching: isFetchingSelectedProducts,
    } = useGetProductsByIdsFromIntegration(
        integrationId,
        // Empty array will return all products, so use dummy value instead
        productIds.length > 0 ? productIds.map(Number) : [0],
        !isLoadingRules,
    )

    const isFetching = isFetchingRules || isFetchingSelectedProducts
    const isLoading = isLoadingRules || isLoadingSelectedProducts

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
        },
        exclude: {
            title: 'Exclude products',
            description: 'Choose products to exclude from recommendations.',
            badge: { label: 'Excluded', type: 'light-error' as const },
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
                isLoading={isLoading || selectedProducts === undefined}
                disableActions={isFetching || isUpserting}
                hasImages={true}
                badge={typeMap[type].badge}
                type={type}
                addButton={{
                    label: 'Add products',
                    onClick: () => setIsDrawerOpen(true),
                }}
                itemLabelSingular="product"
                itemLabelPlural="products"
                items={mapProducts(selectedProducts)}
                onDelete={(deletedProductId: string) =>
                    onUpsert(
                        selectedProducts
                            .map((product) => product.id.toString())
                            .filter(
                                (productId) => productId !== deletedProductId,
                            ),
                    )
                }
                onSeeAllClick={() => setIsSeeAllDrawerOpen(true)}
            />

            <ItemSelectionDrawer
                isOpen={isDrawerOpen}
                isLoading={isLoadingAllProducts}
                hasImages={true}
                title="Add products"
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

            <SelectedItemsDrawer
                title="All products"
                itemLabelPlural="products"
                items={mapProducts(selectedProducts)}
                isOpen={isSeeAllDrawerOpen}
                hasImages={true}
                type={type}
                onClose={() => setIsSeeAllDrawerOpen(false)}
                onSubmit={onUpsert}
            />
        </div>
    )
}
