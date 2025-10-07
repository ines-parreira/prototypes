import { useState } from 'react'

import { useGetEcommerceProductCollections } from 'models/ecommerce/queries'

import usePaginatedProductCollectionsByIds from '../hooks/usePaginatedProductCollectionsByIds'
import usePaginatedProductsByIds from '../hooks/usePaginatedProductsByIds'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const CollectionRecommendationRuleCard = ({
    type,
    integrationId,
    collections,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    collections: string[]
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (collections: string[]) => Promise<any>
}) => {
    const [allCollectionsDrawerConfig, setAllCollectionsDrawerConfig] =
        useState<{
            isOpen: boolean
            cursor: string | null
        }>({
            isOpen: false,
            cursor: null,
        })

    const [collectionProductsDrawerConfig, setCollectionProductsDrawerConfig] =
        useState<{
            isOpen: boolean
            allProductIds: string[]
            collectionTitle: string
        }>({
            isOpen: false,
            allProductIds: [],
            collectionTitle: '',
        })

    const [isSeeAllDrawerOpen, setIsSeeAllDrawerOpen] = useState(false)

    const allCollections = useGetEcommerceProductCollections(
        integrationId,
        {
            limit: 25,
            cursor: allCollectionsDrawerConfig.cursor,
        },
        { enabled: allCollectionsDrawerConfig.isOpen },
    )

    const collectionProducts = usePaginatedProductsByIds({
        integrationId,
        productIds: collectionProductsDrawerConfig.allProductIds,
        enabled: collectionProductsDrawerConfig.isOpen,
    })

    const selectedCollections = usePaginatedProductCollectionsByIds({
        integrationId,
        collectionIds: collections,
        enabled: collections.length > 0,
    })

    const typeMap = {
        promote: {
            title: 'Promote collections',
            description: 'Choose collections to prioritize in recommendations.',
            badge: { label: '★ Promoted', type: 'light-success' as const },
            selectionDrawerTitle: 'Select collections to promote',
            selectedDrawerTitle: 'All promoted collections',
        },
        exclude: {
            title: 'Exclude collections',
            description: 'Choose collections to exclude from recommendations.',
            badge: { label: 'Excluded', type: 'light-error' as const },
            selectionDrawerTitle: 'Select collections to exclude',
            selectedDrawerTitle: 'All excluded collections',
        },
    }

    return (
        <div>
            <RecommendationRuleCard
                title={typeMap[type].title}
                description={typeMap[type].description}
                isLoading={isLoadingRules}
                disableActions={isFetchingRules || isUpserting}
                hasImages={false}
                badge={typeMap[type].badge}
                type={type}
                addButton={{
                    label: 'Select collections',
                    onClick: () =>
                        setAllCollectionsDrawerConfig({
                            isOpen: true,
                            cursor: null,
                        }),
                }}
                itemLabelSingular="collection"
                itemLabelPlural="collections"
                totalItems={collections.length}
                items={selectedCollections.allCollections}
                onShowProducts={(collectionId: string) => {
                    const collection = selectedCollections.collections.find(
                        (collection) => collection.id === collectionId,
                    )
                    if (!collection) return

                    setCollectionProductsDrawerConfig({
                        isOpen: true,
                        collectionTitle: collection.title,
                        allProductIds: collection.productIds,
                    })
                }}
                onDelete={(deletedCollection: string) =>
                    onUpsert(
                        collections.filter(
                            (collection) => collection !== deletedCollection,
                        ),
                    )
                }
                onSeeAllClick={() => setIsSeeAllDrawerOpen(true)}
            />

            <ItemDrawer
                isOpen={allCollectionsDrawerConfig.isOpen}
                isLoading={allCollections.isLoading}
                hasImages={false}
                title={typeMap[type].selectionDrawerTitle}
                itemLabelPlural="collections"
                selectedItemIds={collections}
                onClose={() =>
                    setAllCollectionsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                onSubmit={onUpsert}
                items={(allCollections.data?.data || []).map((collection) => ({
                    id: collection.external_id,
                    title: collection.data.title,
                }))}
                pagination={{
                    hasNextPage: !!allCollections.data?.metadata.next_cursor,
                    hasPrevPage: !!allCollections.data?.metadata.prev_cursor,
                    onNextClick: () => {
                        setAllCollectionsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                allCollections.data?.metadata.next_cursor ??
                                null,
                        }))
                    },
                    onPrevClick: () => {
                        setAllCollectionsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                allCollections.data?.metadata.prev_cursor ??
                                null,
                        }))
                    },
                }}
            />

            <ItemDrawer
                isOpen={collectionProductsDrawerConfig.isOpen}
                isLoading={collectionProducts.isLoading}
                hasImages={true}
                title={`Products within collection: ${collectionProductsDrawerConfig.collectionTitle}`}
                type={type}
                itemLabelPlural="products"
                selectedItemIds={[]}
                onClose={() =>
                    setCollectionProductsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                items={collectionProducts.products.map((product) => ({
                    id: product.id.toString(),
                    title: product.title,
                    status: product.status,
                    img: product.image?.src,
                }))}
                pagination={{
                    hasNextPage: collectionProducts.hasNextPage,
                    hasPrevPage: collectionProducts.hasPrevPage,
                    onNextClick: () =>
                        collectionProducts.fetchPage(
                            collectionProducts.currentPage + 1,
                        ),
                    onPrevClick: () =>
                        collectionProducts.fetchPage(
                            collectionProducts.currentPage - 1,
                        ),
                }}
            />

            <ItemDrawer
                title={typeMap[type].selectedDrawerTitle}
                itemLabelPlural="collections"
                items={selectedCollections.collections}
                selectedItemIds={collections}
                isOpen={isSeeAllDrawerOpen}
                isLoading={false}
                hasImages={false}
                type={type}
                pagination={{
                    hasNextPage: selectedCollections.hasNextPage,
                    hasPrevPage: selectedCollections.hasPrevPage,
                    onNextClick: () =>
                        selectedCollections.fetchPage(
                            selectedCollections.currentPage + 1,
                        ),
                    onPrevClick: () =>
                        selectedCollections.fetchPage(
                            selectedCollections.currentPage - 1,
                        ),
                }}
                onShowProducts={(collectionId: string) => {
                    const collection = selectedCollections.collections.find(
                        (collection) => collection.id === collectionId,
                    )
                    if (!collection) return

                    setIsSeeAllDrawerOpen(false)

                    setCollectionProductsDrawerConfig({
                        isOpen: true,
                        collectionTitle: collection.title,
                        allProductIds: collection.productIds,
                    })
                }}
                onClose={() => {
                    setIsSeeAllDrawerOpen(false)
                    selectedCollections.fetchPage(1)
                }}
                onSubmit={onUpsert}
                onSearch={selectedCollections.setSearchTerm}
            />
        </div>
    )
}
