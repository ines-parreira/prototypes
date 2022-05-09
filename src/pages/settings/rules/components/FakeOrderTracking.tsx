import React from 'react'
import css from './FakeOrderTracking.less'

export const FakeOrderTracking = () => {
    return (
        <div className={css.orderDemo}>
            <div className={css.orderTitleContainer}>
                <div className={css.orderTitle}>Order number</div>
                <div className={css.orderPrice}>Price</div>
            </div>
            <div className={css.fulfillmentContainer}>
                <div className={css.product}>
                    <div className={css.productTitle}>Product 1</div>
                    <div className={css.productPrice}>Price x1</div>
                </div>
                <div className={css.product}>
                    <div className={css.productTitle}>Product 2</div>
                    <div className={css.productPrice}>Price x2</div>
                </div>
                <div className={css.trackingLink}>
                    loremipsum.com/tracking-1234
                </div>
            </div>
            <div className={css.fulfillmentContainer}>
                <div className={css.product}>
                    <div className={css.productTitle}>Product 3</div>
                    <div className={css.productPrice}>Price x1</div>
                </div>
                <div className={css.trackingLink}>
                    loremipsum.com/tracking-4321
                </div>
            </div>
        </div>
    )
}
