import React, { useState } from 'react'

import classNames from 'classnames'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useNotify } from 'hooks/useNotify'
import { OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import { TableWithNestedRows } from 'pages/stats/common/components/Table/TableWithNestedRows'
import { TableWithNestedRowsCell } from 'pages/stats/common/components/Table/TableWithNestedRowsCell'
import { TruncateCellContent } from 'pages/stats/common/components/TruncateCellContent'
import { dummyProducts } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTable'
import topProductsCss from 'pages/stats/voice-of-customer/product-insights/placeholder/TopProductsPerIntent.less'
import {
    columnOrder,
    INTENTS_PER_PAGE,
    LeadColumn,
    TopProductsPerIntentColumn,
    TopProductsPerIntentColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/TopProductsPerIntentConfig'
import { assetsUrl } from 'utils'

type Props = {
    intentsCustomFieldId: number
}

const order: {
    column: TopProductsPerIntentColumn
    direction: OrderDirection
} = {
    column: TopProductsPerIntentColumn.Intent,
    direction: OrderDirection.Desc,
}

const useMockedData = (__: number) => {
    const { info } = useNotify()
    const getSetOrderHandler = (column: TopProductsPerIntentColumn) => () => {
        void info(`setting order: ${column}`)
    }
    const [currentPage, setCurrentPage] = useState(1)

    return {
        currentPage,
        setCurrentPage,
        getSetOrderHandler,
        rows: [
            {
                entityId: 'Order > Damaged',
                children: [
                    {
                        productId: '1',
                        name: 'SonicWave Pro Headphones',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                    {
                        productId: '123',
                        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                ],
            },
            {
                entityId: 'Promotions & Discounts > Issue',
                children: [
                    {
                        productId: '3',
                        name: 'SonicWave Pro Headphones',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                    {
                        productId: '4',
                        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                ],
            },
            {
                entityId: 'Shipping > Change Address',
                children: [
                    {
                        productId: '5',
                        name: 'SonicWave Pro Headphones',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                    {
                        productId: '6',
                        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                ],
            },
            {
                entityId: 'Product > Quality Issues',
                children: [
                    {
                        productId: '5',
                        name: 'SonicWave Pro Headphones',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                    {
                        productId: '6',
                        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                ],
            },
            {
                entityId: 'Product > Details',
                children: [
                    {
                        productId: '5',
                        name: 'SonicWave Pro Headphones',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                    {
                        productId: '6',
                        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                ],
            },
            {
                entityId: 'Some > Other',
                children: [
                    {
                        productId: '5',
                        name: 'SonicWave Pro Headphones',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                    {
                        productId: '6',
                        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
                        thumbnailUrl: 'http://placeholder.img',
                        children: [],
                    },
                ],
            },
        ],
    }
}

export const TopProductsPerIntentTable = ({ intentsCustomFieldId }: Props) => {
    const { rows, currentPage, setCurrentPage, getSetOrderHandler } =
        useMockedData(intentsCustomFieldId)

    return (
        <TableWithNestedRows
            RowComponent={TopProductsRow}
            rows={rows.map((row) => ({
                ...row,
                level: 0,
                leadColumn: LeadColumn,
                children: row.children.map((child) => ({
                    ...child,
                    entityId: row.entityId,
                    leadColumn: LeadColumn,
                    level: 1,
                })),
            }))}
            perPage={INTENTS_PER_PAGE}
            columnOrder={columnOrder}
            leadColumn={LeadColumn}
            sortingOrder={order}
            columnConfig={TopProductsPerIntentColumnConfig}
            getSetOrderHandler={getSetOrderHandler}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isScrollable={false}
        />
    )
}

type IntentRowProps = {
    level: number
    columnOrder?: TopProductsPerIntentColumn[]
    entityId: string
    productId?: string
    leadColumn: TopProductsPerIntentColumn
    onClick?: () => void
}

type CellProps = {
    level: number
    hasChildren: boolean
    column: TopProductsPerIntentColumn
    customFieldValueString: string
    productId?: string
    isLeadColumn: boolean
    onClick?: () => void
    useData: (
        statsFilters: StatsFilters,
        userTimeZone: string,
        customFieldValueString: string,
        productId?: string,
    ) => {
        value: string
    }
}

const TopProductsRow = ({
    columnOrder = [],
    level,
    entityId,
    productId,
    leadColumn,
    onClick,
}: IntentRowProps) => {
    return (
        <>
            {columnOrder.map((column) => (
                <TopProductsCell
                    key={column}
                    column={column}
                    level={level}
                    customFieldValueString={entityId}
                    productId={productId}
                    isLeadColumn={leadColumn === column}
                    useData={TopProductsPerIntentColumnConfig[column].useData}
                    hasChildren={level === 0}
                    onClick={onClick}
                />
            ))}
        </>
    )
}

const TopProductsCell = ({
    column,
    customFieldValueString,
    productId,
    isLeadColumn,
    level,
    useData,
    hasChildren,
    onClick,
}: CellProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { value } = useData(
        cleanStatsFilters,
        userTimezone,
        customFieldValueString,
        productId,
    )

    switch (column) {
        case TopProductsPerIntentColumn.Intent:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={hasChildren}
                    className={classNames(
                        css.leadColumn,
                        topProductsCss.productCell,
                    )}
                    onClick={onClick}
                >
                    {productId ? (
                        <ProductCellContent
                            customFieldValueString={customFieldValueString}
                            productId={productId}
                        />
                    ) : (
                        customFieldValueString
                    )}
                </TableWithNestedRowsCell>
            )
        case TopProductsPerIntentColumn.Volume:
        case TopProductsPerIntentColumn.Delta:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={hasChildren}
                >
                    {value}
                </TableWithNestedRowsCell>
            )
    }
}

const useDummyProductData = (
    __statsFilters: StatsFilters,
    __userTimezone: string,
    __customFieldValueString: string,
    productId: string,
) => {
    const product = dummyProducts.find((p) => p.id === productId)

    return {
        productId,
        thumbnailUrl:
            product?.thumbnailUrl ??
            assetsUrl('/img/stats/voc-preview/product_01.png'),
        name: product?.name ?? `Product id: ${productId}`,
    }
}

const ProductCellContent = ({
    customFieldValueString,
    productId,
}: {
    customFieldValueString: string
    productId: string
}) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { thumbnailUrl, name } = useDummyProductData(
        cleanStatsFilters,
        userTimezone,
        customFieldValueString,
        productId,
    )
    return (
        <>
            <img src={thumbnailUrl} alt={name} />
            <TruncateCellContent content={<a href={'#'}>{name}</a>} />
        </>
    )
}
