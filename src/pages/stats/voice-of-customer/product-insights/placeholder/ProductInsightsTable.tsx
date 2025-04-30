import React, { UIEventHandler, useState } from 'react'

import classNames from 'classnames'

import { useProductInsightsTableSetting } from 'hooks/reporting/useProductInsightsTableConfigSetting'
import useMeasure from 'hooks/useMeasure'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/common/components/Table/AnalyticsTable.less'
import { ProductInsightsCellContent } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsCellContent'
import { ProductInsightsHeaderCellContent } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsHeaderCellContent'
import {
    getColumnWidth,
    ProductInsightsColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTableConfig'
import { assetsUrl } from 'utils'

export const dummyProducts = [
    {
        id: '1',
        name: 'SonicWave Pro Noise-Canceling Headphones SWP-NC500',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_01.png'),
        intent: 'Can I reactivate a lost gift card',
    },
    {
        id: '2',
        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_02.png'),
        intent: 'Need to properly use earbuds wirelessly',
    },
    {
        id: '3',
        name: 'ThunderBass 2.1 Bluetooth Speaker TB21-BS700',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_03.png'),
        intent: 'Can I send evidence of my damaged items for refunds request',
    },
    {
        id: '4',
        name: 'Aurabeam Studio Microphone ABM-SM900',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_04.png'),
        intent: 'what is the longevity of the waterproof earbuds',
    },
    {
        id: '5',
        name: 'Resonix Home Theater Soundbar RHT-SB750',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_05.png'),
        intent: 'Refund Requests due to damage on arrival',
    },
    {
        id: '6',
        name: 'QuickSync Wireless Turntable WSW-TT200',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_06.png'),
        intent: 'Information about the quicksync wireless turntable',
    },
    {
        id: '7',
        name: 'QuietPod Construction Headphones PX-BCH450',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_07.png'),
        intent: 'Claim that construction is still being heard in quetpod',
    },
    {
        id: '8',
        name: 'New Jazz Turntable JT-0198FB',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_08.png'),
        intent: 'Refund is needed for a lot of different construction',
    },
    {
        id: '9',
        name: 'Floating Record player BT-BC9871',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_09.png'),
        intent: 'Why is the color scratching off of the headphones',
    },
]

const useSortedProductsWithData = () => {
    return { products: dummyProducts, isLoading: false }
}

export const ProductInsightsTable = () => {
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const { products, isLoading } = useSortedProductsWithData()
    const { columnsOrder } = useProductInsightsTableSetting()

    return (
        <div ref={ref} className={css.container} onScroll={handleScroll}>
            <TableWrapper
                className={classNames(css.table)}
                style={{ width }}
                height={'comfortable'}
            >
                <TableHead>
                    {columnsOrder.map((column, index) => (
                        <ProductInsightsHeaderCellContent
                            column={column}
                            key={column}
                            width={getColumnWidth(column)}
                            className={classNames(css.BodyCell, {
                                [css.withShadow]:
                                    index === 0 && isTableScrolled,
                            })}
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableBodyRow key={product.id}>
                            {columnsOrder.map((column, index) => (
                                <ProductInsightsCellContent
                                    key={`${product.id}-${column}`}
                                    isLoading={isLoading}
                                    product={product}
                                    intent={product.intent}
                                    column={column}
                                    useMetric={
                                        ProductInsightsColumnConfig[column]
                                            .useMetric
                                    }
                                    width={getColumnWidth(column)}
                                    className={classNames(css.BodyCell, {
                                        [css.withShadow]:
                                            index === 0 && isTableScrolled,
                                    })}
                                />
                            ))}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
        </div>
    )
}
