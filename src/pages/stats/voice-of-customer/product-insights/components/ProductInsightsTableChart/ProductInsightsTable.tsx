import { useState } from 'react'

import { useProductInsightsTableSetting } from 'hooks/reporting/useProductInsightsTableConfigSetting'
import { useSortedProductsWithData } from 'hooks/reporting/voice-of-customer/useSortedProductsWithData'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import { ProductInsightsCellContent } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent'
import { ProductInsightsHeaderCellContent } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsHeaderCellContent'
import css from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTable.less'
import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import {
    ProductTable,
    ProductTableBodyCell,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export const NO_DATA_HEADING = 'No data available'
export const NO_DATA_SUBHEADING = 'Try adjusting filters to get results.'

const NoDataFallback = () => {
    return (
        <div className={css.fallback}>
            <div className={css.fallbackHeading}>{NO_DATA_HEADING}</div>
            <div className={css.fallbackSubheading}>{NO_DATA_SUBHEADING}</div>
        </div>
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

export const ProductInsightsTable = ({
    intentCustomFieldId,
    sentimentCustomFieldId,
}: {
    intentCustomFieldId: number
    sentimentCustomFieldId: number
}) => {
    const { isLoading, products } = useSortedProductsWithData()

    const { columnsOrder } = useProductInsightsTableSetting()

    const pageSize = PAGE_SIZE
    const pagination = usePagination({
        totalItems: products.length,
        pageSize,
    })

    const isEmpty = products.length === 0
    if (isEmpty) return <NoDataFallback />

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
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <LoadingFallback columns={columnsOrder} />
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
