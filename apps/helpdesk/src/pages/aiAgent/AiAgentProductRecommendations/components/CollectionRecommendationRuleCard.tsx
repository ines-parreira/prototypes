import { useState } from 'react'

import { useGetEcommerceProductCollections } from 'models/ecommerce/queries'

import usePaginatedProductCollectionsByIds from '../hooks/usePaginatedProductCollectionsByIds'
import usePaginatedProductsByIds from '../hooks/usePaginatedProductsByIds'
import { FormattedProductRecommendationRules } from '../utils/format-product-recommendation-rules'
import { getProductStatusData } from '../utils/get-product-status-data'
import { getRuleCardLabels } from '../utils/get-rule-card-labels'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const CollectionRecommendationRuleCard = ({
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
        collectionIds: rules[type].collectionIds,
        enabled: rules[type].collectionIds.length > 0,
    })

    const labels = getRuleCardLabels(type, 'collections')

    return (
        <div>
            <RecommendationRuleCard
                title={labels.title}
                description={labels.description}
                isLoading={isLoadingRules}
                disableActions={isFetchingRules || isUpserting}
                hasImages={false}
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
                totalItems={rules[type].collectionIds.length}
                items={selectedCollections.allCollections
                    .slice(0, 4)
                    .map((collection) => ({
                        ...collection,
                        badges: [labels.badge],
                    }))}
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
                        rules[type].collectionIds.filter(
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
                title={labels.selectionDrawerTitle}
                itemLabelPlural="collections"
                selectedItemIds={rules[type].collectionIds}
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
                    badges: rules[
                        type === 'promote' ? 'exclude' : 'promote'
                    ].collectionIds.includes(collection.external_id)
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
                                  tooltip: `Collection is currently ${type === 'promote' ? 'excluded' : 'promoted'}. Select and save changes to modify status.`,
                              },
                          ]
                        : [],
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
                itemLabelPlural="products"
                selectedItemIds={[]}
                onClose={() =>
                    setCollectionProductsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                items={collectionProducts.products.map((product) => {
                    const data = getProductStatusData(
                        {
                            id: product.id.toString(),
                            tags: product.tags?.split(', '),
                            vendor: product.vendor,
                            status: product.status,
                        },
                        type,
                        rules,
                    )

                    return {
                        id: product.id.toString(),
                        title: product.title,
                        description: data.description,
                        img: product.image?.src,
                        badges: data.badges,
                    }
                })}
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
                title={labels.selectedDrawerTitle}
                itemLabelPlural="collections"
                items={selectedCollections.collections}
                selectedItemIds={rules[type].collectionIds}
                isOpen={isSeeAllDrawerOpen}
                isLoading={false}
                hasImages={false}
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
