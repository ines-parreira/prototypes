import classNames from 'classnames'

import { SummaryItemData } from './types'

import css from './SummaryLineItem.less'

type CancelledLineItemProps = {
    summaryItem: SummaryItemData
}
const SummaryLineItem = ({ summaryItem }: CancelledLineItemProps) => {
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
                        {summaryItem.cadence}
                    </>
                </div>
            </div>
            <div
                className={classNames(css.price, {
                    [css.strikeThrough]: summaryItem.strickenOut,
                })}
            >
                <span>{summaryItem.amount}</span>/{summaryItem.cadence}
            </div>
        </div>
    )
}

export default SummaryLineItem
