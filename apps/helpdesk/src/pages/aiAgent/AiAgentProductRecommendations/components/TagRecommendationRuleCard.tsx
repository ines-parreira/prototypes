import { useState } from 'react'

import {
    useGetEcommerceLookupValues,
    useGetEcommerceProducts,
} from 'models/ecommerce/queries'

import { usePaginatedItems } from '../hooks/usePaginatedItems'
import type { FormattedProductRecommendationRules } from '../utils/format-product-recommendation-rules'
import { getProductStatusData } from '../utils/get-product-status-data'
import { getRuleCardLabels } from '../utils/get-rule-card-labels'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const TagRecommendationRuleCard = ({
    type,
    integrationId,
    rules,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
    tagsWithExceptions,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    rules: FormattedProductRecommendationRules
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (tags: string[]) => Promise<any>
    tagsWithExceptions: string[]
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

    const selectedTags = rules[type].tags.map((tag) => ({
        id: tag,
        title: tag,
        badges: tagsWithExceptions.includes(tag)
            ? [
                  {
                      label: 'Exceptions',
                      type: 'light-warning' as const,
                      tooltip: `Some products are ${type === 'promote' ? 'excluded' : 'promoted'} because of conflicting rules.`,
                  },
              ]
            : [],
    }))

    const paginatedSelectedTags = usePaginatedItems(selectedTags)

    const labels = getRuleCardLabels(type, 'tags')

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
                totalItems={rules[type].tags.length}
                items={selectedTags.slice(0, 4).map((tag) => ({
                    ...tag,
                    badges: [labels.badge, ...tag.badges],
                }))}
                onShowProducts={(tag: string) => {
                    setTagProductsDrawerConfig({
                        isOpen: true,
                        tag,
                        cursor: null,
                    })
                }}
                onDelete={(deletedTag: string) =>
                    onUpsert(
                        rules[type].tags.filter((tag) => tag !== deletedTag),
                    )
                }
                onSeeAllClick={() => {
                    paginatedSelectedTags.resetPagination()
                    setIsSeeAllDrawerOpen(true)
                }}
            />

            <ItemDrawer
                isOpen={allTagsDrawerConfig.isOpen}
                isLoading={allTags.isLoading}
                hasImages={false}
                title={labels.selectionDrawerTitle}
                itemLabelPlural="tags"
                selectedItemIds={rules[type].tags}
                onClose={() =>
                    setAllTagsDrawerConfig((old) => ({ ...old, isOpen: false }))
                }
                onSubmit={onUpsert}
                items={(allTags.data?.data || []).map((tag) => ({
                    id: tag.value,
                    title: tag.value,
                    badges: rules[
                        type === 'promote' ? 'exclude' : 'promote'
                    ].tags.includes(tag.value)
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
                                  tooltip: `Tag is currently ${type === 'promote' ? 'excluded' : 'promoted'}. Select and save changes to modify status.`,
                              },
                          ]
                        : [],
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
                itemLabelPlural="products"
                selectedItemIds={[]}
                onClose={() =>
                    setTagProductsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                items={(tagProducts.data?.data || []).map((product) => {
                    const data = getProductStatusData(
                        {
                            id: product.external_id,
                            tags: product.data.tags,
                            vendor: product.data.vendor,
                            status: product.data.status,
                        },
                        type,
                        rules,
                    )

                    return {
                        id: product.external_id,
                        title: product.data.title,
                        description: data.description,
                        img: product.data.featuredMedia?.image?.url,
                        badges: data.badges,
                    }
                })}
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
                title={labels.selectedDrawerTitle}
                itemLabelPlural="tags"
                items={paginatedSelectedTags.paginatedItems}
                selectedItemIds={rules[type].tags}
                isOpen={isSeeAllDrawerOpen}
                isLoading={false}
                hasImages={false}
                pagination={paginatedSelectedTags.pagination}
                onShowProducts={(tag: string) => {
                    setIsSeeAllDrawerOpen(false)
                    setTagProductsDrawerConfig({
                        isOpen: true,
                        tag,
                        cursor: null,
                    })
                }}
                onClose={() => setIsSeeAllDrawerOpen(false)}
                onSubmit={onUpsert}
                onSearch={paginatedSelectedTags.setSearch}
            />
        </div>
    )
}
