import { useEffect, useState } from 'react'

import { useGetEcommerceLookupValues } from 'models/ecommerce/queries'

import { ItemSelectionDrawer } from './ItemSelectionDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'
import { SelectedItemsDrawer } from './SelectedItemsDrawer'

export const VendorRecommendationRuleCard = ({
    type,
    integrationId,
    vendors,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    vendors: string[]
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (vendors: string[]) => Promise<any>
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSeeAllDrawerOpen, setIsSeeAllDrawerOpen] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)
    const [params, setParams] = useState<
        Parameters<typeof useGetEcommerceLookupValues>[2]
    >({ limit: 25 })

    // Only load vendors when drawer is open
    useEffect(() => {
        if (!isDrawerOpen) {
            return
        }

        setIsEnabled(true)
    }, [isDrawerOpen])

    const { data, isLoading: isLoadingAllVendors } =
        useGetEcommerceLookupValues('vendor', integrationId, params, {
            enabled: isEnabled,
        })

    const allVendors = (data?.data || []).map((vendor) => ({
        id: vendor.value,
        title: vendor.value,
    }))

    const selectedVendors = vendors.map((vendor) => ({
        id: vendor,
        title: vendor,
    }))

    const { next_cursor: nextCursor, prev_cursor: prevCursor } =
        data?.metadata || {}

    const typeMap = {
        promote: {
            title: 'Promote vendors',
            description: 'Choose vendors to prioritize in recommendations.',
            badge: { label: '\u2605 Promoted', type: 'light-success' as const },
        },
        exclude: {
            title: 'Exclude vendors',
            description: 'Choose vendors to exclude from recommendations.',
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
                    label: 'Add vendors',
                    onClick: () => setIsDrawerOpen(true),
                }}
                itemLabelSingular="vendor"
                itemLabelPlural="vendors"
                items={selectedVendors}
                onDelete={(deletedVendor: string) =>
                    onUpsert(
                        vendors.filter((vendor) => vendor !== deletedVendor),
                    )
                }
                onSeeAllClick={() => setIsSeeAllDrawerOpen(true)}
            />

            <ItemSelectionDrawer
                isOpen={isDrawerOpen}
                isLoading={isLoadingAllVendors}
                hasImages={false}
                title="Add vendors"
                itemLabelPlural="vendors"
                selectedItemIds={vendors}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={onUpsert}
                items={allVendors}
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

            <SelectedItemsDrawer
                title="All vendors"
                itemLabelPlural="vendors"
                items={selectedVendors}
                isOpen={isSeeAllDrawerOpen}
                hasImages={false}
                onClose={() => setIsSeeAllDrawerOpen(false)}
                onSubmit={onUpsert}
            />
        </div>
    )
}
