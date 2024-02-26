import React from 'react'
import SummaryLineItem from './SummaryLineItem'
import {SummaryItemData} from './types'
import css from './SummaryBody.less'
import SummaryTotal from './SummaryTotal'

export type SummaryBodyProps = {
    items: SummaryItemData[]
    total: number
    interval: string
}
const SummaryBody = ({items, total, interval}: SummaryBodyProps) => {
    return (
        <div className={css.container}>
            <div>
                <div className={css.header}>
                    <div>PRODUCT</div>
                    <div>PRICE</div>
                </div>
                {items.map((summaryItem) => (
                    <SummaryLineItem
                        key={summaryItem.title}
                        summaryItem={summaryItem}
                    />
                ))}
            </div>
            <SummaryTotal total={total} interval={interval} />
            <div className={css.taxNotion}>
                <span>Prices exclusive of sales tax</span>
            </div>
        </div>
    )
}

export default SummaryBody
