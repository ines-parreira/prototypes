import { useEffect, useState } from 'react'

import { useGetEcommerceLookupValues } from 'models/ecommerce/queries'

import { ItemSelectionDrawer } from './ItemSelectionDrawer'
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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)
    const [params, setParams] = useState<
        Parameters<typeof useGetEcommerceLookupValues>[2]
    >({ limit: 25 })

    // Only load tags when drawer is open
    useEffect(() => {
        if (!isDrawerOpen) {
            return
        }

        setIsEnabled(true)
    }, [isDrawerOpen])

    const { data, isLoading: isLoadingAllTags } = useGetEcommerceLookupValues(
        'product_tag',
        integrationId,
        params,
        { enabled: isEnabled },
    )

    const allTags = data?.data || []
    const { next_cursor: nextCursor, prev_cursor: prevCursor } =
        data?.metadata || {}

    const typeMap = {
        promote: {
            title: 'Promote tags',
            description: 'Choose tags to prioritize in recommendations.',
            badge: { label: '\u2605 Promoted', type: 'light-success' as const },
        },
        exclude: {
            title: 'Exclude tags',
            description: 'Choose tags to exclude from recommendations.',
            badge: { label: 'Excluded', type: 'light-error' as const },
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
