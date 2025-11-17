import React, { useRef, useState } from 'react'

import classnames from 'classnames'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import type {
    BigCommerceActionType,
    BigCommerceCart,
} from 'models/integration/types'
import {
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import NumberInput from 'pages/common/forms/input/NumberInput'
import { getMoneySymbol } from 'utils/getMoneySymbol'

import { PopoverContainer } from './components/popover-container/PopoverContainer'

import css from './Discount.less'
import commonCss from './OrderTotals.less'

type Props = {
    cart: Maybe<BigCommerceCart>
    currencyCode: string | null
    onUpdateDiscountAmount: (
        actionName: BigCommerceActionType,
        discountAmount: number,
    ) => Promise<void>
    actionName: BigCommerceActionType
}

export function Discount({
    cart,
    currencyCode,
    onUpdateDiscountAmount,
    actionName,
}: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isUpdatingDiscount, setIsUpdatingDiscount] = useState(false)

    const [discountAmount, setDiscountAmount] = useState<number | undefined>(
        cart?.discount_amount,
    )
    const [error, setError] = useState<string | null>(null)

    const onClose = () => {
        setError(null)
        setIsPopoverOpen(false)
    }

    const onApply = async () => {
        if (typeof discountAmount === 'undefined') {
            return
        }

        setIsUpdatingDiscount(true)

        try {
            await onUpdateDiscountAmount(actionName, discountAmount)
            onClose()
        } catch (error) {
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                onClose()
            } else {
                setError(BigCommerceGeneralErrorMessage.defaultError)
            }
        } finally {
            setIsUpdatingDiscount(false)
        }
    }

    const onRemove = async () => {
        setIsUpdatingDiscount(true)

        try {
            await onUpdateDiscountAmount(actionName, 0)
            onClose()
            setDiscountAmount(0)
        } catch (error) {
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                onClose()
            } else {
                setError(BigCommerceGeneralErrorMessage.defaultError)
            }
        } finally {
            setIsUpdatingDiscount(false)
        }
    }

    const onToggle = () => {
        if (isPopoverOpen) {
            setError(null)
        }
        setIsPopoverOpen((isDropdownOpen) => !isDropdownOpen)
    }

    const cartDiscountAmount = cart?.discount_amount ?? 0

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
                        <LoadingSpinner color="dark" size="small" />
                    </div>
                )}
                <MoneyAmount
                    amount={String(cartDiscountAmount)}
                    currencyCode={currencyCode}
                    renderIfZero
                    negative
                />
            </dd>
            <PopoverContainer
                isOpen={isPopoverOpen}
                onToggle={onToggle}
                target={buttonRef}
                body={
                    <div className={css.discountContainer}>
                        <Label htmlFor="discount-amount" className={css.label}>
                            Discount amount
                        </Label>
                        <NumberInput
                            prefix={
                                <span className={css.amountPrefix}>
                                    {getMoneySymbol(currencyCode ?? 'USD')}
                                </span>
                            }
                            value={discountAmount}
                            onChange={setDiscountAmount}
                            hasControls={false}
                            step={0.01}
                            id="discount-amount"
                            hasError={!!error}
                        />
                        {error && (
                            <div className={`mt-1 ${css.errorMessage}`}>
                                {error}
                            </div>
                        )}
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
