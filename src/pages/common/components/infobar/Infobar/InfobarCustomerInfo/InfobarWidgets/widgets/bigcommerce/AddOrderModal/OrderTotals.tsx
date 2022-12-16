import React from 'react'
import {
    BigCommerceIntegration,
    BigCommerceConsignment,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {ShippingMethod} from './ShippingMethod'

type Props = {
    consignment: Maybe<BigCommerceConsignment>
    integration: BigCommerceIntegration
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

const dtStyle = {fontWeight: 400}

export default function OrderTotals({
    integration,
    consignment,
    onUpdateConsignmentShippingMethod,
    totals: {subTotal, shipping, taxes, total},
    hasError = false,
}: Props) {
    const currencyCode =
        integration.meta && integration.meta.currency
            ? integration.meta.currency
            : null

    return (
        <div>
            <dl className="row text-left mb-0">
                <dt className="col-9 mb-2" style={dtStyle}>
                    Add discount
                </dt>
                <dd className="col-3 mb-2">-</dd>

                <dt className="col-9 mb-2" style={dtStyle}>
                    Apply coupon or gift certificate
                </dt>
                <dd className="col-3 mb-2">-</dd>

                <dt className="col-9 mb-2" style={dtStyle}>
                    Subtotal
                </dt>
                <dd className="col-3 mb-2">
                    <MoneyAmount
                        renderIfZero={true}
                        amount={String(subTotal)}
                        currencyCode={currencyCode}
                    />
                </dd>

                <ShippingMethod
                    currencyCode={currencyCode}
                    consignment={consignment}
                    shippingCost={shipping}
                    onUpdateConsignmentShippingMethod={
                        onUpdateConsignmentShippingMethod
                    }
                    hasError={hasError}
                />

                <dt className="col-9 mb-2" style={dtStyle}>
                    Taxes
                </dt>
                <dd className="col-3 mb-2">
                    <MoneyAmount
                        renderIfZero={true}
                        amount={String(taxes)}
                        currencyCode={currencyCode}
                    />
                </dd>
            </dl>
            <hr />
            <dl className="row text-left mb-0">
                <dt className="col-9 mb-2">Total</dt>
                <dd className="col-3 mb-2">
                    <strong>
                        <MoneyAmount
                            renderIfZero={true}
                            amount={String(total)}
                            currencyCode={currencyCode}
                        />
                    </strong>
                </dd>
            </dl>
            <br />
        </div>
    )
}
