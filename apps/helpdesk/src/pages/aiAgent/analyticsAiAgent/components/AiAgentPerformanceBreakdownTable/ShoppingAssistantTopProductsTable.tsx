import { useMemo } from 'react'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Avatar,
    Box,
    HeaderRowGroup,
    Icon,
    Skeleton,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    useTable,
} from '@gorgias/axiom'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { ProductTableContentCell } from 'domains/reporting/pages/automate/aiSalesAgent/types/productTable'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'
import { formatPercentage } from 'pages/common/utils/numbers'

import css from './PerformanceBreakdownTable.less'

const PLACEHOLDER_DATA: ProductTableContentCell[] = [
    {
        product: {
            id: 0,
            title: 'Loading...',
            created_at: '',
            image: null,
            images: [],
            options: [],
            variants: [],
        },
        metrics: {
            [ProductTableKeys.NumberOfRecommendations]: 0,
            [ProductTableKeys.CTR]: 0,
            [ProductTableKeys.BTR]: 0,
        },
    },
]

export const ShoppingAssistantTopProductsTable = () => {
    const { data, isFetching } = useShoppingAssistantTopProductsMetrics()

    const tableData = useMemo(
        () => (data.length > 0 ? data : PLACEHOLDER_DATA),
        [data],
    )

    const columns: ColumnDef<ProductTableContentCell>[] = useMemo(
        () => [
            {
                accessorKey: 'product',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="xxxs"
                            className={css.featureName}
                        >
                            <Text size="sm" variant="bold">
                                Product name
                            </Text>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-up'
                                            : 'arrow-down'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Product name' },
                cell: (info) => {
                    const product =
                        info.getValue() as ProductTableContentCell['product']
                    if (isFetching && product.id === 0) {
                        return (
                            <Skeleton
                                key="product-name-loading"
                                width="200px"
                                height="20px"
                            />
                        )
                    }
                    const imageUrl = product.images?.[0]?.src
                    return (
                        <Box display="flex" alignItems="center" gap="xs">
                            <Avatar
                                size="md"
                                url={imageUrl}
                                name={product.title || 'Product'}
                            />
                            <Text
                                size="md"
                                variant="bold"
                                className={css.featureName}
                            >
                                {product.url ? (
                                    <a
                                        href={product.url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                    >
                                        {product.title}
                                    </a>
                                ) : (
                                    product.title
                                )}
                            </Text>
                        </Box>
                    )
                },
                enableHiding: false,
                sortingFn: (rowA, rowB) => {
                    const titleA = rowA.original.product.title || ''
                    const titleB = rowB.original.product.title || ''
                    return titleA.localeCompare(titleB)
                },
            },
            {
                id: ProductTableKeys.NumberOfRecommendations,
                accessorFn: (row) =>
                    row.metrics[ProductTableKeys.NumberOfRecommendations] ?? 0,
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Times recommended</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Times recommended"
                                    caption="The total number of times Shopping Assistant recommended a product."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-up'
                                            : 'arrow-down'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Times recommended' },
                cell: (info) => {
                    const value = info.getValue() as number
                    if (isFetching && info.row.original.product.id === 0) {
                        return (
                            <Skeleton
                                key="recommendations-loading"
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return value.toLocaleString()
                },
                enableHiding: true,
            },
            {
                id: ProductTableKeys.CTR,
                accessorFn: (row) => row.metrics[ProductTableKeys.CTR] ?? 0,
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Click-through rate</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Click-through rate"
                                    caption="The percentage of a product recommendation that customers click."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-up'
                                            : 'arrow-down'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Click-through rate' },
                cell: (info) => {
                    const value = info.getValue() as number
                    if (isFetching && info.row.original.product.id === 0) {
                        return (
                            <Skeleton
                                key="ctr-loading"
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatPercentage(value)
                },
                enableHiding: true,
            },
            {
                id: ProductTableKeys.BTR,
                accessorFn: (row) => row.metrics[ProductTableKeys.BTR] ?? 0,
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Buy through rate</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Buy through rate"
                                    caption="The percentage of a product recommendation that result in a purchase."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-up'
                                            : 'arrow-down'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Buy through rate' },
                cell: (info) => {
                    const value = info.getValue() as number
                    if (isFetching && info.row.original.product.id === 0) {
                        return (
                            <Skeleton
                                key="btr-loading"
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatPercentage(value)
                },
                enableHiding: true,
            },
        ],
        [isFetching],
    )

    const table = useTable({
        data: tableData,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
    })

    return (
        <Box display="flex" flexDirection="column" minWidth="0px">
            <TableToolbar
                table={table}
                bottomRow={{
                    left: ['totalCount'],
                    right: ['settings'],
                }}
            />
            <Box className={css.tableWrapper}>
                <TableRoot withBorder className={css.table}>
                    <TableHeader>
                        <HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>
                    <TableBodyContent
                        rows={table.getRowModel().rows}
                        columnCount={table.getAllColumns().length}
                        table={table}
                    />
                </TableRoot>
            </Box>
        </Box>
    )
}
