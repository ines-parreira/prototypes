import React, {useRef, useState} from 'react'
import classnames from 'classnames'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import Label from 'pages/common/forms/Label/Label'
import NumberInput from 'pages/common/forms/input/NumberInput'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import Button from 'pages/common/components/button/Button'
import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
} from 'models/integration/types'
import Caption from 'pages/common/forms/Caption/Caption'
import {PopoverContainer} from '../popover-container/PopoverContainer'

import {
    isBigCommerceCartLineItem,
    useCanViewBigCommerceV1Features,
} from '../../utils'

import commonCss from '../../OrderTotals.less'
import css from './OrderLineItemRow.less'

type Props = {
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    currencyCode: Maybe<string>
    handleDiscount: (newPrice: number) => void
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

export default function PriceComponent({
    lineItem,
    currencyCode,
    handleDiscount,
}: Props) {
    const canViewBigCommerceV1Features = useCanViewBigCommerceV1Features()

    // Keep a reference to initial line item before any discounts are applied
    // After a discount is applied to `lineItem` the `id` stays the same
    // but there is no more reference to an original price, so we have to
    // keep a reference to "original" `lineItem` manually
    const originalLineItemRef = useRef(lineItem)
    const originalLineItem = originalLineItemRef.current

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const fullPrice = originalLineItem.list_price
    const discountedPrice = lineItem.list_price

    const onPopoverToggle = () =>
        setIsPopoverOpen((isDropdownOpen) => !isDropdownOpen)

    const currentDiscountAmount = fullPrice - discountedPrice

    const [discountAmount, setDiscountAmount] = useState<number | undefined>(
        currentDiscountAmount
    )

    const canAddDiscount =
        canViewBigCommerceV1Features && isBigCommerceCartLineItem(lineItem)

    const hasError = (discountAmount ?? 0) > fullPrice

    return (
        <>
            <td className={css.numberCol}>
                {canAddDiscount && currentDiscountAmount > 0 ? (
                    <div className={css.striked}>
                        <Amount
                            amount={fullPrice}
                            currencyCode={currencyCode}
                        />
                    </div>
                ) : null}
                {canAddDiscount ? (
                    <button
                        onClick={onPopoverToggle}
                        className={classnames(commonCss.actionButton)}
                        ref={buttonRef}
                        id="discount-button"
                    >
                        <Amount
                            amount={discountedPrice}
                            currencyCode={currencyCode}
                        />
                    </button>
                ) : (
                    <Amount amount={fullPrice} currencyCode={currencyCode} />
                )}
            </td>
            <PopoverContainer
                isOpen={isPopoverOpen}
                onToggle={onPopoverToggle}
                target={buttonRef}
                body={
                    <div className={css.priceComponentPopover}>
                        <Label htmlFor="discount-amount" className={css.label}>
                            Discount amount
                        </Label>
                        <NumberInput
                            id="discount-amount"
                            value={discountAmount}
                            onChange={setDiscountAmount}
                            prefix={
                                <span className={css.amountPrefix}>
                                    {getShopifyMoneySymbol(
                                        currencyCode ?? 'USD'
                                    )}
                                </span>
                            }
                            hasError={hasError}
                            hasControls={false}
                            step={0.01}
                        />
                        {hasError ? (
                            <Caption
                                id="discount-amount-caption"
                                error="Discount cannot be more than the price"
                            />
                        ) : null}
                    </div>
                }
                footer={
                    <>
                        {currentDiscountAmount > 0 ? (
                            <Button
                                intent="destructive"
                                onClick={() => {
                                    handleDiscount(fullPrice)
                                    setDiscountAmount(0)
                                    setIsPopoverOpen(false)
                                }}
                            >
                                Remove
                            </Button>
                        ) : (
                            <Button
                                intent="secondary"
                                onClick={() => setIsPopoverOpen(false)}
                            >
                                Close
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                handleDiscount(
                                    discountAmount
                                        ? fullPrice - discountAmount
                                        : fullPrice
                                )
                                setIsPopoverOpen(false)
                            }}
                            isDisabled={hasError}
                        >
                            Apply
                        </Button>
                    </>
                }
            />
        </>
    )
}
