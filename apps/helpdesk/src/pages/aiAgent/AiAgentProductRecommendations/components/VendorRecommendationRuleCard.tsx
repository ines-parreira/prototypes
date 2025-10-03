import { useState } from 'react'

import {
    useGetEcommerceLookupValues,
    useGetEcommerceProducts,
} from 'models/ecommerce/queries'

import { usePaginatedItems } from '../hooks/usePaginatedItems'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

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
    const [allVendorsDrawerConfig, setAllVendorsDrawerConfig] = useState<{
        isOpen: boolean
        cursor: string | null
        searchValue: string | null
    }>({
        isOpen: false,
        cursor: null,
        searchValue: null,
    })

    const [vendorProductsDrawerConfig, setVendorProductsDrawerConfig] =
        useState<{
            isOpen: boolean
            cursor: string | null
            vendor: string | null
        }>({
            isOpen: false,
            cursor: null,
            vendor: null,
        })

    const [isSeeAllDrawerOpen, setIsSeeAllDrawerOpen] = useState(false)

    const allVendors = useGetEcommerceLookupValues(
        'vendor',
        integrationId,
        {
            limit: 25,
            cursor: allVendorsDrawerConfig.cursor,
            value: allVendorsDrawerConfig.searchValue ?? undefined,
        },
        { enabled: allVendorsDrawerConfig.isOpen },
    )

    const vendorProducts = useGetEcommerceProducts(
        integrationId,
        {
            limit: 25,
            cursor: vendorProductsDrawerConfig.cursor,
            data_vendor: vendorProductsDrawerConfig.vendor ?? undefined,
        },
        { enabled: vendorProductsDrawerConfig.isOpen },
    )

    const selectedVendors = vendors.map((vendor) => ({
        id: vendor,
        title: vendor,
    }))

    const paginatedSelectedVendors = usePaginatedItems(selectedVendors)

    const typeMap = {
        promote: {
            title: 'Promote vendors',
            description: 'Choose vendors to prioritize in recommendations.',
            badge: { label: '\u2605 Promoted', type: 'light-success' as const },
            selectionDrawerTitle: 'Select vendors to promote',
            selectedDrawerTitle: 'All promoted vendors',
        },
        exclude: {
            title: 'Exclude vendors',
            description: 'Choose vendors to exclude from recommendations.',
            badge: { label: 'Excluded', type: 'light-error' as const },
            selectionDrawerTitle: 'Select vendors to exclude',
            selectedDrawerTitle: 'All excluded vendors',
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
                    label: 'Select vendors',
                    onClick: () =>
                        setAllVendorsDrawerConfig({
                            isOpen: true,
                            cursor: null,
                            searchValue: null,
                        }),
                }}
                itemLabelSingular="vendor"
                itemLabelPlural="vendors"
                totalItems={vendors.length}
                items={selectedVendors}
                onShowProducts={(vendor: string) => {
                    setVendorProductsDrawerConfig({
                        isOpen: true,
                        vendor,
                        cursor: null,
                    })
                }}
                onDelete={(deletedVendor: string) =>
                    onUpsert(
                        vendors.filter((vendor) => vendor !== deletedVendor),
                    )
                }
                onSeeAllClick={() => setIsSeeAllDrawerOpen(true)}
            />

            <ItemDrawer
                isOpen={allVendorsDrawerConfig.isOpen}
                isLoading={allVendors.isLoading}
                hasImages={false}
                title={typeMap[type].selectionDrawerTitle}
                itemLabelPlural="vendors"
                selectedItemIds={vendors}
                onClose={() =>
                    setAllVendorsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                onSubmit={onUpsert}
                items={(allVendors.data?.data || []).map((vendor) => ({
                    id: vendor.value,
                    title: vendor.value,
                }))}
                pagination={{
                    hasNextPage: !!allVendors.data?.metadata.next_cursor,
                    hasPrevPage: !!allVendors.data?.metadata.prev_cursor,
                    onNextClick: () => {
                        setAllVendorsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                allVendors.data?.metadata.next_cursor ?? null,
                        }))
                    },
                    onPrevClick: () => {
                        setAllVendorsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                allVendors.data?.metadata.prev_cursor ?? null,
                        }))
                    },
                }}
                onSearch={(value) => {
                    setAllVendorsDrawerConfig((old) => ({
                        ...old,
                        searchValue: value,
                    }))
                }}
            />

            <ItemDrawer
                isOpen={vendorProductsDrawerConfig.isOpen}
                isLoading={vendorProducts.isLoading}
                hasImages={true}
                title={`Products within vendor: ${vendorProductsDrawerConfig.vendor}`}
                type={type}
                itemLabelPlural="products"
                selectedItemIds={[]}
                onClose={() =>
                    setVendorProductsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                items={(vendorProducts.data?.data || []).map((product) => ({
                    id: product.external_id,
                    title: product.data.title,
                    status: product.data.status,
                    img: product.data.featuredMedia?.image?.url,
                }))}
                pagination={{
                    hasNextPage: !!vendorProducts.data?.metadata.next_cursor,
                    hasPrevPage: !!vendorProducts.data?.metadata.prev_cursor,
                    onNextClick: () => {
                        setVendorProductsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                vendorProducts.data?.metadata.next_cursor ??
                                null,
                        }))
                    },
                    onPrevClick: () => {
                        setVendorProductsDrawerConfig((old) => ({
                            ...old,
                            cursor:
                                vendorProducts.data?.metadata.prev_cursor ??
                                null,
                        }))
                    },
                }}
            />

            <ItemDrawer
                title={typeMap[type].selectedDrawerTitle}
                itemLabelPlural="vendors"
                items={paginatedSelectedVendors.paginatedItems}
                selectedItemIds={vendors}
                isOpen={isSeeAllDrawerOpen}
                isLoading={false}
                hasImages={false}
                type={type}
                pagination={paginatedSelectedVendors.pagination}
                onShowProducts={(vendor: string) => {
                    setIsSeeAllDrawerOpen(false)
                    setVendorProductsDrawerConfig({
                        isOpen: true,
                        vendor,
                        cursor: null,
                    })
                }}
                onClose={() => {
                    setIsSeeAllDrawerOpen(false)
                    paginatedSelectedVendors.resetPagination()
                }}
                onSubmit={onUpsert}
                onSearch={paginatedSelectedVendors.setSearch}
            />
        </div>
    )
}
