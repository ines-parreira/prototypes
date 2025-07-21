import { useState } from 'react'

import { useProductInsightsTableSetting } from 'domains/reporting/hooks/useProductInsightsTableConfigSetting'
import { useSortedProducts } from 'domains/reporting/hooks/voice-of-customer/useSortedProducts'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ProductInsightsCellContent } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsCellContent'
import { ProductInsightsHeaderCellContent } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsHeaderCellContent'
import css from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTable.less'
import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
    ProductInsightsColumnConfig,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import {
    ProductTable,
    ProductTableBodyCell,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductTable'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'

export const NO_DATA_HEADING = 'No data available'
export const NO_DATA_SUBHEADING = 'Try adjusting filters to get results.'

const NoDataFallback = ({ colSpan }: { colSpan: number }) => {
    return (
        <tr>
            <td colSpan={colSpan}>
                <div className={css.fallback}>
                    <div className={css.fallbackHeading}>{NO_DATA_HEADING}</div>
                    <div className={css.fallbackSubheading}>
                        {NO_DATA_SUBHEADING}
                    </div>
                </div>
            </td>
        </tr>
    )
}

const usePagination = ({
    totalItems,
    pageSize,
    initialPage = 1,
}: {
    totalItems: number
    pageSize: number
    initialPage?: number
}) => {
    const [page, setPage] = useState(initialPage)
    const pages = Math.ceil(totalItems / pageSize)
    const hasPagination = totalItems > pageSize

    return { page, setPage, pages, hasPagination }
}

export const PAGE_SIZE = 10

const getSortingQueryHook = (
    column: ProductInsightsTableColumns,
    intentCustomFieldId: number,
    sentimentCustomFieldId: number,
): ((
    statsFilters: StatsFilters,
    userTimezone: string,
    sorting: OrderDirection,
) => {
    data: {
        allData: any[]
        value: number | null
    } | null
    isFetching: boolean
    isError: boolean
}) => {
    if (column === ProductInsightsTableColumns.ReturnMentions) {
        return (
            statsFilters: StatsFilters,
            userTimezone: string,
            sorting: OrderDirection,
        ) =>
            ProductInsightsColumnConfig[column].sortingHook(
                statsFilters,
                userTimezone,
                intentCustomFieldId,
                sorting,
            )
    } else if (
        column === ProductInsightsTableColumns.PositiveSentiment ||
        column === ProductInsightsTableColumns.NegativeSentiment ||
        column === ProductInsightsTableColumns.NegativeSentimentDelta ||
        column === ProductInsightsTableColumns.PositiveSentimentDelta
    ) {
        return (
            statsFilters: StatsFilters,
            userTimezone: string,
            sorting: OrderDirection,
        ) =>
            ProductInsightsColumnConfig[column].sortingHook(
                statsFilters,
                userTimezone,
                sentimentCustomFieldId,
                undefined,
                sorting,
            )
    }
    return (
        statsFilters: StatsFilters,
        userTimezone: string,
        sorting: OrderDirection,
    ) =>
        ProductInsightsColumnConfig[column].sortingHook(
            statsFilters,
            userTimezone,
            sorting,
        )
}

export const ProductInsightsTable = ({
    intentCustomFieldId,
    sentimentCustomFieldId,
}: {
    intentCustomFieldId: number
    sentimentCustomFieldId: number
}) => {
    const { isLoading, products } = useSortedProducts()

    const { columnsOrder } = useProductInsightsTableSetting()

    const pageSize = PAGE_SIZE
    const pagination = usePagination({
        totalItems: products.length,
        pageSize,
    })

    const isEmpty = products.length === 0
    const currentPage = pagination.page - 1
    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = products.slice(startIndex, endIndex)

    return (
        <>
            <ProductTable>
                <TableHead>
                    {columnsOrder.map((column) => (
                        <ProductInsightsHeaderCellContent
                            key={column}
                            column={column}
                            useSortingQuery={getSortingQueryHook(
                                column,
                                intentCustomFieldId,
                                sentimentCustomFieldId,
                            )}
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {isLoading && isEmpty ? (
                        <LoadingFallback columns={columnsOrder} />
                    ) : isEmpty ? (
                        <NoDataFallback colSpan={columnsOrder.length} />
                    ) : (
                        paginatedProducts.map((product) => (
                            <TableBodyRow key={product.id} className={css.row}>
                                {columnsOrder.map((column) => (
                                    <ProductInsightsCellContent
                                        key={column}
                                        column={column}
                                        product={product}
                                        intentCustomFieldId={
                                            intentCustomFieldId
                                        }
                                        sentimentCustomFieldId={
                                            sentimentCustomFieldId
                                        }
                                    />
                                ))}
                            </TableBodyRow>
                        ))
                    )}
                </TableBody>
            </ProductTable>
            {pagination.hasPagination && (
                <NumberedPagination
                    count={pagination.pages}
                    page={pagination.page}
                    onChange={pagination.setPage}
                    className={css.pagination}
                />
            )}
        </>
    )
}

const loadingRows = Array.from({ length: 10 }, (_, index) => index)

const LoadingFallback = ({
    columns,
}: {
    columns: ProductInsightsTableColumns[]
}) => {
    return (
        <>
            {loadingRows.map((index) => {
                return (
                    <TableBodyRow key={index} className={css.row}>
                        {columns.map((column) => (
                            <ProductTableBodyCell
                                key={column}
                                width={getColumnWidth(column)}
                                isSticky={getIsLeadColumn(column)}
                                justifyContent={getColumnAlignment(column)}
                                isLoading
                            />
                        ))}
                    </TableBodyRow>
                )
            })}
        </>
    )
}
