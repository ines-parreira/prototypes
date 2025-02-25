import React from 'react'

import { Cadence } from 'models/billing/types'

import SummaryLineItem from './SummaryLineItem'
import SummaryTotal from './SummaryTotal'
import { SummaryItemData } from './types'

import css from './SummaryBody.less'

export type SummaryBodyProps = {
    items: SummaryItemData[]
    total: number
    cadence: Cadence
}
const SummaryBody = ({ items, total, cadence }: SummaryBodyProps) => {
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
            <SummaryTotal total={total} cadence={cadence} />
            <div className={css.taxNotion}>
                <span>Prices exclusive of sales tax</span>
            </div>
        </div>
    )
}

export default SummaryBody
