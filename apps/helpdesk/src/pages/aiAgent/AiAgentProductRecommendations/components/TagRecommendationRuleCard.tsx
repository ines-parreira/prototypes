import { useEffect, useState } from 'react'

import { useGetEcommerceProductTags } from 'models/ecommerce/queries'

import { ItemSelectionDrawer } from './ItemSelectionDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const TagRecommendationRuleCard = ({
    integrationId,
    tags,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    integrationId: number
    tags: string[]
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (tags: string[]) => Promise<void>
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)
    const [params, setParams] = useState<
        Parameters<typeof useGetEcommerceProductTags>[1]
    >({ limit: 25 })

    // Only load tags when drawer is open
    useEffect(() => {
        if (!isDrawerOpen) {
            return
        }

        setIsEnabled(true)
    }, [isDrawerOpen])

    const { data, isLoading: isLoadingAllTags } = useGetEcommerceProductTags(
        integrationId,
        params,
        { enabled: isEnabled },
    )

    const allTags = data?.data || []
    const { next_cursor: nextCursor, prev_cursor: prevCursor } =
        data?.metadata || {}

    return (
        <div>
            <RecommendationRuleCard
                title="Exclude tags"
                description="Choose tags to exclude from recommendations."
                isLoading={isLoadingRules}
                disableActions={isFetchingRules || isUpserting}
                hasImages={false}
                badge={{ label: 'Excluded', type: 'light-error' }}
                addButton={{
                    label: 'Add tags',
                    onClick: () => setIsDrawerOpen(true),
                }}
                itemLabelSingular="tag"
                itemLabelPlural="tags"
                items={tags.map((tag) => ({
                    id: tag,
                    title: tag,
                }))}
                onDelete={(deletedTag: string) =>
                    onUpsert(tags.filter((tag) => tag !== deletedTag))
                }
            />

            <ItemSelectionDrawer
                isOpen={isDrawerOpen}
                isLoading={isLoadingAllTags}
                hasImages={false}
                title="Add tags"
                itemLabelPlural="tags"
                selectedItemIds={tags}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={onUpsert}
                items={allTags.map((tag) => ({
                    id: tag.value,
                    title: tag.value,
                }))}
                pagination={{
                    hasNextPage: !!nextCursor,
                    hasPrevPage: !!prevCursor,
                    onNextClick: () => {
                        setParams({ ...params, cursor: nextCursor })
                    },
                    onPrevClick: () => {
                        setParams({ ...params, cursor: prevCursor })
                    },
                }}
                onSearch={(value) => {
                    setParams({ ...params, value })
                }}
            />
        </div>
    )
}
