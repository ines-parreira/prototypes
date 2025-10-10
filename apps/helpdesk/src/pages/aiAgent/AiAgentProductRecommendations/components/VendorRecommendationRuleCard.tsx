import { useState } from 'react'

import {
    useGetEcommerceLookupValues,
    useGetEcommerceProducts,
} from 'models/ecommerce/queries'

import { usePaginatedItems } from '../hooks/usePaginatedItems'
import { FormattedProductRecommendationRules } from '../utils/format-product-recommendation-rules'
import { getProductStatusData } from '../utils/get-product-status-data'
import { getRuleCardLabels } from '../utils/get-rule-card-labels'
import { ItemDrawer } from './ItemDrawer'
import { RecommendationRuleCard } from './RecommendationRuleCard'

export const VendorRecommendationRuleCard = ({
    type,
    integrationId,
    rules,
    isLoadingRules,
    isFetchingRules,
    isUpserting,
    onUpsert,
    vendorsWithExceptions,
}: {
    type: 'promote' | 'exclude'
    integrationId: number
    rules: FormattedProductRecommendationRules
    isLoadingRules: boolean
    isFetchingRules: boolean
    isUpserting: boolean
    onUpsert: (vendors: string[]) => Promise<any>
    vendorsWithExceptions: string[]
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

    const selectedVendors = rules[type].vendors.map((vendor) => ({
        id: vendor,
        title: vendor,
        badges: vendorsWithExceptions.includes(vendor)
            ? [
                  {
                      label: 'Exceptions',
                      type: 'light-warning' as const,
                      tooltip: `Some products are ${type === 'promote' ? 'excluded' : 'promoted'} because of conflicting rules.`,
                  },
              ]
            : [],
    }))

    const paginatedSelectedVendors = usePaginatedItems(selectedVendors)

    const labels = getRuleCardLabels(type, 'vendors')

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
                totalItems={rules[type].vendors.length}
                items={selectedVendors.slice(0, 4).map((vendor) => ({
                    ...vendor,
                    badges: [labels.badge, ...vendor.badges],
                }))}
                onShowProducts={(vendor: string) => {
                    setVendorProductsDrawerConfig({
                        isOpen: true,
                        vendor,
                        cursor: null,
                    })
                }}
                onDelete={(deletedVendor: string) =>
                    onUpsert(
                        rules[type].vendors.filter(
                            (vendor) => vendor !== deletedVendor,
                        ),
                    )
                }
                onSeeAllClick={() => {
                    paginatedSelectedVendors.resetPagination()
                    setIsSeeAllDrawerOpen(true)
                }}
            />

            <ItemDrawer
                isOpen={allVendorsDrawerConfig.isOpen}
                isLoading={allVendors.isLoading}
                hasImages={false}
                title={labels.selectionDrawerTitle}
                itemLabelPlural="vendors"
                selectedItemIds={rules[type].vendors}
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
                    badges: rules[
                        type === 'promote' ? 'exclude' : 'promote'
                    ].vendors.includes(vendor.value)
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
                                  tooltip: `Vendor is currently ${type === 'promote' ? 'excluded' : 'promoted'}. Select and save changes to modify status.`,
                              },
                          ]
                        : [],
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
                itemLabelPlural="products"
                selectedItemIds={[]}
                onClose={() =>
                    setVendorProductsDrawerConfig((old) => ({
                        ...old,
                        isOpen: false,
                    }))
                }
                items={(vendorProducts.data?.data || []).map((product) => {
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
                title={labels.selectedDrawerTitle}
                itemLabelPlural="vendors"
                items={paginatedSelectedVendors.paginatedItems}
                selectedItemIds={rules[type].vendors}
                isOpen={isSeeAllDrawerOpen}
                isLoading={false}
                hasImages={false}
                pagination={paginatedSelectedVendors.pagination}
                onShowProducts={(vendor: string) => {
                    setIsSeeAllDrawerOpen(false)
                    setVendorProductsDrawerConfig({
                        isOpen: true,
                        vendor,
                        cursor: null,
                    })
                }}
                onClose={() => setIsSeeAllDrawerOpen(false)}
                onSubmit={onUpsert}
                onSearch={paginatedSelectedVendors.setSearch}
            />
        </div>
    )
}
