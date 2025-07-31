import { useEffect, useState } from 'react'

import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'

import { ItemSelectionDrawer } from './ItemSelectionDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const ProductRecommendationRuleCard = ({
    integrationId,
    productIds,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    integrationId: number
    productIds: string[]
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (productIds: string[]) => Promise<void>
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
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

    return (
        <div>
            <RecommendationRuleCard
                title="Exclude products"
                description="Choose products to exclude from recommendations."
                isLoading={isLoading || selectedProducts === undefined}
                disableActions={isFetching || isUpserting}
                hasImages={true}
                badge={{ label: 'Excluded', type: 'light-error' }}
                addButton={{
                    label: 'Add products',
                    onClick: () => setIsDrawerOpen(true),
                }}
                itemLabelSingular="product"
                itemLabelPlural="products"
                items={selectedProducts.map((product) => ({
                    id: product.id.toString(),
                    title: product.title,
                    img: product.image?.src,
                }))}
                onDelete={(deletedProductId: string) =>
                    onUpsert(
                        selectedProducts
                            .map((product) => product.id.toString())
                            .filter(
                                (productId) => productId !== deletedProductId,
                            ),
                    )
                }
            />

            <ItemSelectionDrawer
                isOpen={isDrawerOpen}
                isLoading={isLoadingAllProducts}
                hasImages={true}
                title="Add products"
                itemLabelPlural="products"
                selectedItemIds={productIds}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={onUpsert}
                items={
                    allProducts?.map((product) => ({
                        id: product.id.toString(),
                        title: product.title,
                        img: product.image?.src,
                    })) || []
                }
                pagination={{
                    hasNextPage,
                    hasPrevPage,
                    onNextClick: fetchNext,
                    onPrevClick: fetchPrev,
                }}
                onSearch={setSearchTerm}
            />
        </div>
    )
}
