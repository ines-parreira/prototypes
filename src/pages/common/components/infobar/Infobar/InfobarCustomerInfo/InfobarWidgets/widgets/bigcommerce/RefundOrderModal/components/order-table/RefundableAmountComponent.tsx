import React, {useState} from 'react'
import classNames from 'classnames'

import CheckBox from 'pages/common/forms/CheckBox'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import bigcommerceLineItemRowCss from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/components/order-table/OrderLineItemRow.less'

type Props = {
    costName: string
    fullPrice?: number
    discountedPrice?: number
    initialAmount: number
    availableAmount: number
    refundedAmount: number
    isAmountRefunded: boolean
    setIsAmountRefunded: (isAmountRefunded: boolean) => void
    currencyCode?: Maybe<string>
    isLoading: boolean
}

const Amount = ({
    amount,
    currencyCode,
}: {
    amount: number
    currencyCode?: Maybe<string>
}) => {
    return (
        <MoneyAmount
            renderIfZero
            amount={String(amount)}
            currencyCode={currencyCode ? currencyCode : null}
        />
    )
}

export function RefundableAmountComponent({
    costName,
    fullPrice,
    discountedPrice,
    availableAmount,
    initialAmount,
    refundedAmount,
    isAmountRefunded,
    setIsAmountRefunded,
    currencyCode,
    isLoading,
}: Props) {
    const [amountToRefund, setAmountToRefund] = useState(0)

    const hasDiscount = fullPrice !== discountedPrice

    return (
        <tr>
            <td className={bigcommerceLineItemRowCss.descriptionColThin}>
                <span
                    className={classNames({
                        [bigcommerceLineItemRowCss.isDisabled]:
                            !availableAmount,
                    })}
                >
                    {costName}
                </span>
            </td>
            <td className={bigcommerceLineItemRowCss.numberColLarge}>
                {hasDiscount && fullPrice && (
                    <div
                        className={classNames(
                            bigcommerceLineItemRowCss.striked
                        )}
                    >
                        <Amount
                            amount={fullPrice}
                            currencyCode={currencyCode}
                        />
                    </div>
                )}
                <div
                    className={classNames({
                        [bigcommerceLineItemRowCss.isDisabled]:
                            !availableAmount,
                    })}
                >
                    <Amount
                        amount={availableAmount}
                        currencyCode={currencyCode}
                    />
                    {refundedAmount > 0 && (
                        <div
                            className={
                                bigcommerceLineItemRowCss.refundedQuantityDescription
                            }
                        >
                            <Amount
                                amount={refundedAmount}
                                currencyCode={currencyCode}
                            />
                            {'/'}
                            <Amount
                                amount={initialAmount}
                                currencyCode={currencyCode}
                            />
                            {' refunded'}
                        </div>
                    )}
                </div>
            </td>
            <td>
                <div className={bigcommerceLineItemRowCss.quantityColSmall}>
                    <CheckBox
                        className={bigcommerceLineItemRowCss.isDisabled}
                        isChecked={isAmountRefunded}
                        onChange={() => {
                            setIsAmountRefunded(!isAmountRefunded)
                            setAmountToRefund(
                                isAmountRefunded ? 0 : availableAmount
                            )
                        }}
                        isDisabled={!availableAmount || isLoading}
                    />
                </div>
            </td>
            <td>
                <div
                    className={classNames(
                        bigcommerceLineItemRowCss.numberColSmall,
                        {
                            [bigcommerceLineItemRowCss.isDisabled]:
                                !availableAmount || !amountToRefund,
                        }
                    )}
                >
                    <Amount
                        amount={amountToRefund}
                        currencyCode={currencyCode}
                    />
                </div>
            </td>
        </tr>
    )
}
