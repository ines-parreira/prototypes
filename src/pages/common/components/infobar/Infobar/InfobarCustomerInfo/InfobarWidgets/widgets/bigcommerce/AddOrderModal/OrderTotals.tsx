import React from 'react'
import classnames from 'classnames'
import {
    BigCommerceIntegration,
    BigCommerceConsignment,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {ShippingMethod} from './ShippingMethod'

import css from './OrderTotals.less'

type Props = {
    consignment: Maybe<BigCommerceConsignment>
    integration: BigCommerceIntegration
    hasShippingAddress: boolean
    onUpdateConsignmentShippingMethod: (
        selectedShippingMethodId: Maybe<string>
    ) => Promise<void>
    totals: {
        subTotal: number
        shipping: number
        taxes: number
        total: number
    }
    hasError?: boolean
}

const TotalLine = ({
    label,
    value,
    currencyCode,
}: {
    label: string
    value: number
    currencyCode: string | null
}) => (
    <div className={css.descriptionLineContainer}>
        <dt className={css.descriptionTitle}>{label}</dt>
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
    </div>
)

export default function OrderTotals({
    integration,
    consignment,
    hasShippingAddress,
    onUpdateConsignmentShippingMethod,
    totals: {subTotal, shipping, taxes, total},
    hasError = false,
}: Props) {
    const currencyCode =
        integration.meta && integration.meta.currency
            ? integration.meta.currency
            : null

    return (
        <dl>
            <TotalLine
                label="Add discount"
                value={0}
                currencyCode={currencyCode}
            />

            <TotalLine
                label="Apply coupon or gift certificate"
                value={0}
                currencyCode={currencyCode}
            />

            <TotalLine
                label="Subtotal"
                value={subTotal}
                currencyCode={currencyCode}
            />

            <ShippingMethod
                currencyCode={currencyCode}
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
            />

            <div
                className={classnames(
                    css.descriptionLineContainer,
                    css.totalLineContainer
                )}
            >
                <dt>Total</dt>
                <dd>
                    <strong>
                        <MoneyAmount
                            renderIfZero={true}
                            amount={String(total)}
                            currencyCode={currencyCode}
                        />
                    </strong>
                </dd>
            </div>
        </dl>
    )
}
