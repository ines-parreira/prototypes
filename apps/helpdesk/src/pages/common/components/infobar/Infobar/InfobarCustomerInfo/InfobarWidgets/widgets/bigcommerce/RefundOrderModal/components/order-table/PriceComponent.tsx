import classNames from 'classnames'

import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

type Props = {
    fullPrice: number
    discountedPrice: number
    isDisabled?: boolean
    currencyCode?: Maybe<string>
}

export function PriceComponent({
    fullPrice,
    discountedPrice,
    isDisabled = false,
    currencyCode,
}: Props) {
    const hasDiscount = fullPrice !== discountedPrice

    return (
        <td className={bigcommerceLineItemRowCss.numberColLarge}>
            {hasDiscount && (
                <div className={bigcommerceLineItemRowCss.striked}>
                    <MoneyAmount
                        renderIfZero
                        amount={String(fullPrice)}
                        currencyCode={currencyCode ? currencyCode : null}
                    />
                </div>
            )}
            <div
                className={classNames({
                    [bigcommerceLineItemRowCss.isDisabled]: isDisabled,
                })}
            >
                <MoneyAmount
                    renderIfZero
                    amount={String(discountedPrice)}
                    currencyCode={currencyCode ? currencyCode : null}
                />
            </div>
        </td>
    )
}
