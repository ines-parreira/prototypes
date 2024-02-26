import React from 'react'
import classNames from 'classnames'
import css from './SummaryLineItem.less'
import {SummaryItemData} from './types'

type CancelledLineItemProps = {
    summaryItem: SummaryItemData
}
const SummaryLineItem = ({summaryItem}: CancelledLineItemProps) => {
    return (
        <div className={css.container}>
            <div
                className={classNames({
                    [css.strikeThrough]: summaryItem.strickenOut,
                })}
            >
                <div className={css.title}>{summaryItem.title}</div>
                <div className={css.description}>
                    {summaryItem.label}
                    <>
                        {summaryItem.quotaAmount} {summaryItem.counter} /{' '}
                        {summaryItem.interval}
                    </>
                </div>
            </div>
            <div
                className={classNames(css.price, {
                    [css.strikeThrough]: summaryItem.strickenOut,
                })}
            >
                <span>{summaryItem.amount}</span>/{summaryItem.interval}
            </div>
        </div>
    )
}

export default SummaryLineItem
