import React from 'react'
import {
    BigCommerceIntegration,
    BigCommerceCart,
    BigCommerceCustomerAddress,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {ShippingMethod} from './ShippingMethod'

type Props = {
    cart: Maybe<BigCommerceCart>
    shippingAddress: Maybe<BigCommerceCustomerAddress>
    integration: BigCommerceIntegration
}

export default function OrderTotals({
    integration,
    cart,
    shippingAddress,
}: Props) {
    const subTotal = cart ? cart.base_amount : 0
    const total = cart ? cart.cart_amount : 0
    const taxes = total && subTotal ? total - subTotal : 0

    const currencyCode =
        integration && integration.meta && integration.meta.currency
            ? integration.meta.currency
            : null

    const dtStyle = {fontWeight: 400}
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
                    integrationId={integration.id}
                    currencyCode={currencyCode}
                    cart={cart}
                    shippingAddress={shippingAddress}
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
