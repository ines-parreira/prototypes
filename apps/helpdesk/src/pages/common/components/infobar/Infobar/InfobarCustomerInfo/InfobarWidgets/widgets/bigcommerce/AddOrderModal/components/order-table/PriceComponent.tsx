import React, { useRef, useState } from 'react'

import classnames from 'classnames'

import { Label } from '@gorgias/axiom'

import {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import Caption from 'pages/common/forms/Caption/Caption'
import NumberInput from 'pages/common/forms/input/NumberInput'
import { getMoneySymbol } from 'utils/getMoneySymbol'

import { isBigCommerceCartLineItem } from '../../utils'
import { PopoverContainer } from '../popover-container/PopoverContainer'

import commonCss from '../../OrderTotals.less'
import css from './OrderLineItemRow.less'

type Props = {
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    currencyCode: Maybe<string>
    handleDiscount: (newPrice: number, action: 'add' | 'remove') => void
    discounts: Map<string, number>
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
    discounts,
}: Props) {
    // Keep a reference to initial line item before any discounts are applied
    // After a discount is applied to `lineItem` the `id` stays the same
    // but there is no more reference to an original price, so we have to
    // keep a reference to "original" `lineItem` manually
    const originalLineItemRef = useRef(lineItem)
    const originalLineItem = originalLineItemRef.current

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const fullPrice = discounts.get(lineItem.id) || originalLineItem.list_price
    const discountedPrice = lineItem.list_price

    const onPopoverToggle = () =>
        setIsPopoverOpen((isDropdownOpen) => !isDropdownOpen)

    const currentDiscountAmount = fullPrice - discountedPrice

    const [discountAmount, setDiscountAmount] = useState<number | undefined>(
        currentDiscountAmount,
    )

    const canAddDiscount = isBigCommerceCartLineItem(lineItem)

    const hasError = (discountAmount ?? 0) > fullPrice
    const hasDiscount = discounts.has(lineItem.id)

    return (
        <>
            <td className={css.numberCol}>
                {canAddDiscount && hasDiscount ? (
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
                        <Label htmlFor="discount-amount">Discount amount</Label>
                        <NumberInput
                            id="discount-amount"
                            value={discountAmount}
                            onChange={setDiscountAmount}
                            prefix={
                                <span className={css.amountPrefix}>
                                    {getMoneySymbol(currencyCode || 'USD')}
                                </span>
                            }
                            hasError={hasError}
                            hasControls={false}
                            step={0.01}
                        />
                        {hasError ? (
                            <Caption
                                id="discount-amount-caption"
                                error="Discount cannot be higher than the price."
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
                                    try {
                                        handleDiscount(fullPrice, 'remove')
                                        setDiscountAmount(0)
                                    } catch (error) {
                                        console.error(error)
                                    } finally {
                                        setIsPopoverOpen(false)
                                    }
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
                                try {
                                    handleDiscount(
                                        discountAmount
                                            ? fullPrice - discountAmount
                                            : fullPrice,
                                        discountAmount ? 'add' : 'remove',
                                    )
                                } catch (error) {
                                    console.error(error)
                                } finally {
                                    setIsPopoverOpen(false)
                                }
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
