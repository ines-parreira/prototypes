import React, {useRef, useState} from 'react'

import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import NumberInput from 'pages/common/forms/input/NumberInput'
import Label from 'pages/common/forms/Label/Label'

import {BigCommerceCart} from 'models/integration/types'
import Spinner from 'pages/common/components/Spinner'
import getShopifyMoneySymbol from '../../shopify/shared/helpers'

import {PopoverContainer} from './components/PopoverContainer'

import {useCanViewBigCommerceV1Features} from './utils'

import commonCss from './OrderTotals.less'
import css from './Discount.less'

type Props = {
    cart: Maybe<BigCommerceCart>
    currencyCode: string | null
    onUpdateDiscountAmount: (discountAmount: number) => Promise<void>
}

export function Discount({cart, currencyCode, onUpdateDiscountAmount}: Props) {
    const canViewBigCommerceV1Features = useCanViewBigCommerceV1Features()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isUpdatingDiscount, setIsUpdatingDiscount] = useState(false)

    const [discountAmount, setDiscountAmount] = useState<number | undefined>(
        cart?.discount_amount
    )

    const onClose = () => setIsPopoverOpen(false)

    const onApply = async () => {
        if (typeof discountAmount === 'undefined') {
            return
        }

        onClose()

        setIsUpdatingDiscount(true)
        await onUpdateDiscountAmount(discountAmount)
        setIsUpdatingDiscount(false)
    }

    const onRemove = async () => {
        onClose()

        setIsUpdatingDiscount(true)
        await onUpdateDiscountAmount(0)
        setDiscountAmount(0)
        setIsUpdatingDiscount(false)
    }

    const onToggle = () => setIsPopoverOpen((isDropdownOpen) => !isDropdownOpen)

    const cartDiscountAmount = cart?.discount_amount ?? 0

    if (!canViewBigCommerceV1Features) {
        return null
    }

    return (
        <>
            <dt className={commonCss.descriptionTitle}>
                <button
                    onClick={onToggle}
                    className={classnames(commonCss.actionButton)}
                    ref={buttonRef}
                    id="discount-button"
                >
                    Add discount
                </button>
            </dt>
            <div />
            <dd
                className={classnames(commonCss.descriptionValue, {
                    [commonCss.descriptionValueZero]: cartDiscountAmount === 0,
                })}
            >
                {isUpdatingDiscount && (
                    <div className="mr-3">
                        <Spinner color="dark" width="20px" />
                    </div>
                )}
                <MoneyAmount
                    amount={String(cartDiscountAmount)}
                    currencyCode={currencyCode}
                    renderIfZero
                />
            </dd>
            <PopoverContainer
                isOpen={isPopoverOpen}
                onToggle={onToggle}
                target={buttonRef}
                body={
                    <div>
                        <Label htmlFor="discount-amount" className={css.label}>
                            Discount amount
                        </Label>
                        <NumberInput
                            prefix={
                                <span className={css.amountPrefix}>
                                    {getShopifyMoneySymbol(
                                        currencyCode ?? 'USD'
                                    )}
                                </span>
                            }
                            value={discountAmount}
                            onChange={setDiscountAmount}
                            hasControls={false}
                            step={0.01}
                            id="discount-amount"
                        />
                    </div>
                }
                footer={
                    <>
                        {cartDiscountAmount > 0 ? (
                            <Button intent="destructive" onClick={onRemove}>
                                Remove
                            </Button>
                        ) : (
                            <Button intent="secondary" onClick={onClose}>
                                Close
                            </Button>
                        )}
                        <Button onClick={onApply}>Apply</Button>
                    </>
                }
            />
        </>
    )
}
