import { useState } from 'react'

import {
    useGetEcommerceLookupValues,
    useGetEcommerceProducts,
} from 'models/ecommerce/queries'

import { usePaginatedItems } from '../hooks/usePaginatedItems'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const TagRecommendationRuleCard = ({
    type,
    integrationId,
    tags,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    tags: string[]
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (tags: string[]) => Promise<any>
}) => {
    const [allTagsDrawerConfig, setAllTagsDrawerConfig] = useState<{
        isOpen: boolean
        cursor: string | null
        searchValue: string | null
    }>({
        isOpen: false,
        cursor: null,
        searchValue: null,
    })

    const [tagProductsDrawerConfig, setTagProductsDrawerConfig] = useState<{
        isOpen: boolean
        cursor: string | null
        tag: string | null
    }>({
        isOpen: false,
        cursor: null,
        tag: null,
    })

    const [isSeeAllDrawerOpen, setIsSeeAllDrawerOpen] = useState(false)

    const allTags = useGetEcommerceLookupValues(
        'product_tag',
        integrationId,
        {
            limit: 25,
            cursor: allTagsDrawerConfig.cursor,
            value: allTagsDrawerConfig.searchValue ?? undefined,
        },
        { enabled: allTagsDrawerConfig.isOpen },
    )

    const tagProducts = useGetEcommerceProducts(
        integrationId,
        {
            limit: 25,
            cursor: tagProductsDrawerConfig.cursor,
            data_tags: tagProductsDrawerConfig.tag ?? undefined,
        },
        { enabled: tagProductsDrawerConfig.isOpen },
    )

    const selectedTags = tags.map((tag) => ({
        id: tag,
        title: tag,
    }))

    const paginatedSelectedTags = usePaginatedItems(selectedTags)

    const typeMap = {
        promote: {
            title: 'Promote tags',
            description: 'Choose tags to prioritize in recommendations.',
            badge: { label: '\u2605 Promoted', type: 'light-success' as const },
            selectionDrawerTitle: 'Select tags to promote',
            selectedDrawerTitle: 'All promoted tags',
        },
        exclude: {
            title: 'Exclude tags',
            description: 'Choose tags to exclude from recommendations.',
            badge: { label: 'Excluded', type: 'light-error' as const },
            selectionDrawerTitle: 'Select tags to exclude',
            selectedDrawerTitle: 'All excluded tags',
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
                    label: 'Select tags',
                    onClick: () =>
                        setAllTagsDrawerConfig({
                            isOpen: true,
                            cursor: null,
                            searchValue: null,
                        }),
                }}
                itemLabelSingular="tag"
                itemLabelPlural="tags"
                totalItems={tags.length}
                items={selectedTags}
                onShowProducts={(tag: string) => {
                    setTagProductsDrawerConfig({
                        isOpen: true,
                        tag,
                        cursor: null,
                    })
                }}
                onDelete={(deletedTag: string) =>
                    onUpsert(tags.filter((tag) => tag !== deletedTag))
                }
                onSeeAllClick={() => setIsSeeAllDrawerOpen(true)}
            />

            <ItemDrawer
                isOpen={allTagsDrawerConfig.isOpen}
                isLoading={allTags.isLoading}
                hasImages={false}
                title={typeMap[type].selectionDrawerTitle}
                itemLabelPlural="tags"
                selectedItemIds={tags}
                onClose={() =>
                    setAllTagsDrawerConfig((old) => ({ ...old, isOpen: false }))
                }
                onSubmit={onUpsert}
                items={(allTags.data?.data || []).map((tag) => ({
                    id: tag.value,
                    title: tag.value,
                }))}
                pagination={{
                    hasNextPage: !!allTags.data?.metadata.next_cursor,
                    hasPrevPage: !!allTags.data?.metadata.prev_cursor,
                    onNextClick: () => {
                        setAllTagsDrawerConfig((old) => ({
                            ...old,
                            cursor: allTags.data?.metadata.next_cursor ?? null,
                        }))
                    },
                    onPrevClick: () => {
                        setAllTagsDrawerConfig((old) => ({
                            ...old,
                            cursor: allTags.data?.metadata.prev_cursor ?? null,
                        }))
                    },
                }}
                onSearch={(value) => {
                    setAllTagsDrawerConfig((old) => ({
                        ...old,
                        searchValue: value,
                    }))
                }}
            />

            <ItemDrawer
                isOpen={tagProductsDrawerConfig.isOpen}
                isLoading={tagProducts.isLoading}
                hasImages={true}
                title={`Products within tag: ${tagProductsDrawerConfig.tag}`}
                type={type}
                itemLabelPlural="products"
                selectedItemIds={[]}
                onClose={() =>
                    setTagProductsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                items={(tagProducts.data?.data || []).map((product) => ({
                    id: product.external_id,
                    title: product.data.title,
                    status: product.data.status,
                    img: product.data.featuredMedia?.image?.url,
                }))}
                pagination={{
                    hasNextPage: !!tagProducts.data?.metadata.next_cursor,
                    hasPrevPage: !!tagProducts.data?.metadata.prev_cursor,
                    onNextClick: () => {
                        setTagProductsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                tagProducts.data?.metadata.next_cursor ?? null,
                        }))
                    },
                    onPrevClick: () => {
                        setTagProductsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                tagProducts.data?.metadata.prev_cursor ?? null,
                        }))
                    },
                }}
            />

            <ItemDrawer
                title={typeMap[type].selectedDrawerTitle}
                itemLabelPlural="tags"
                items={paginatedSelectedTags.paginatedItems}
                selectedItemIds={tags}
                isOpen={isSeeAllDrawerOpen}
                isLoading={false}
                hasImages={false}
                type={type}
                pagination={paginatedSelectedTags.pagination}
                onShowProducts={(tag: string) => {
                    setIsSeeAllDrawerOpen(false)
                    setTagProductsDrawerConfig({
                        isOpen: true,
                        tag,
                        cursor: null,
                    })
                }}
                onClose={() => {
                    setIsSeeAllDrawerOpen(false)
                    paginatedSelectedTags.resetPagination()
                }}
                onSubmit={onUpsert}
                onSearch={paginatedSelectedTags.setSearch}
            />
        </div>
    )
}
