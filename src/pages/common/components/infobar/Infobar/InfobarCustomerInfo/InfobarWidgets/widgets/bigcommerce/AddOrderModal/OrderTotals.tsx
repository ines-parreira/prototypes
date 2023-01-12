import React from 'react'
import classnames from 'classnames'
import {
    BigCommerceConsignment,
    BigCommerceCart,
    BigCommerceCheckout,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import Loader from 'pages/common/components/Loader/Loader'
import {ShippingMethod} from './ShippingMethod'
import {buildTaxExtraInfo} from './utils'

import css from './OrderTotals.less'
import {Discount} from './Discount'
import {Coupon} from './Coupon'

type Props = {
    cart: Maybe<BigCommerceCart>
    checkout: Maybe<BigCommerceCheckout>
    consignment: Maybe<BigCommerceConsignment>
    hasShippingAddress: boolean
    onUpdateConsignmentShippingMethod: (
        selectedShippingMethodId: Maybe<string>
    ) => Promise<void>
    onUpdateDiscountAmount: (discountAmount: number) => Promise<void>
    onUpdateCoupon: (coupon: string) => Promise<void>
    onRemoveCoupon: () => Promise<void>
    totals: {
        subTotal: number
        shipping: number
        taxes: number
        total: number
    }
    hasError?: boolean
    isTotalPriceLoading: boolean
    currencyCode: string
}

const TotalLine = ({
    label,
    value,
    currencyCode,
    hasExtraInfo = false,
    extraInfo,
}: {
    label: string
    value: number
    currencyCode: string | null
    hasExtraInfo?: boolean
    extraInfo?: string | null
}) => (
    <>
        <dt className={css.descriptionTitle}>{label}</dt>
        {hasExtraInfo ? (
            <dd
                className={classnames(css.descriptionExtraInfo, {
                    [css.isDisabled]: !extraInfo,
                })}
            >
                {extraInfo || '⎯'}
            </dd>
        ) : (
            <div />
        )}
        <dd
            className={classnames(css.descriptionValue, {
                [css.descriptionValueZero]: value === 0,
            })}
        >
            <MoneyAmount
                amount={String(value)}
                currencyCode={currencyCode}
                renderIfZero
            />
        </dd>
    </>
)

export default function OrderTotals({
    checkout,
    cart,
    consignment,
    hasShippingAddress,
    onUpdateConsignmentShippingMethod,
    onUpdateDiscountAmount,
    onUpdateCoupon,
    onRemoveCoupon,
    totals: {subTotal, shipping, taxes, total},
    hasError = false,
    isTotalPriceLoading,
    currencyCode,
}: Props) {
    return (
        <dl className={css.totalsContainer}>
            <TotalLine
                label="Subtotal"
                value={subTotal}
                currencyCode={currencyCode}
            />

            <Discount
                cart={cart}
                currencyCode={currencyCode}
                onUpdateDiscountAmount={onUpdateDiscountAmount}
            />

            <Coupon
                cart={cart}
                currencyCode={currencyCode}
                onUpdateCoupon={onUpdateCoupon}
                onRemoveCoupon={onRemoveCoupon}
            />

            <ShippingMethod
                currencyCode={currencyCode}
                cart={cart}
                consignment={consignment}
                hasShippingAddress={hasShippingAddress}
                shippingCost={shipping}
                onUpdateConsignmentShippingMethod={
                    onUpdateConsignmentShippingMethod
                }
                hasError={hasError}
            />

            <TotalLine
                label="Taxes"
                value={taxes}
                currencyCode={currencyCode}
                hasExtraInfo
                extraInfo={buildTaxExtraInfo({taxes: checkout?.taxes})}
            />

            <div className={css.totalLineContainer}>
                <dt>Total</dt>
                <dd>
                    <div className={css.totalPriceContainer}>
                        {isTotalPriceLoading && (
                            <div className="ml-3">
                                <Loader minHeight="20px" size="20px" />
                            </div>
                        )}
                        <div className="ml-3">
                            <strong>
                                <MoneyAmount
                                    renderIfZero={true}
                                    amount={String(total)}
                                    currencyCode={currencyCode}
                                />
                            </strong>
                        </div>
                    </div>
                </dd>
            </div>
        </dl>
    )
}
