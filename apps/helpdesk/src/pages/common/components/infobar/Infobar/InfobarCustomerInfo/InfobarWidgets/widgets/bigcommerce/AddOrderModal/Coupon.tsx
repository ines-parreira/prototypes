import React, { useReducer, useRef, useState } from 'react'

import classnames from 'classnames'

import { LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

import type { BigCommerceCart } from 'models/integration/types'
import {
    BigCommerceCouponError,
    BigCommerceCouponErrorMessage,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
} from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import InputField from 'pages/common/forms/input/InputField'

import { PopoverContainer } from './components/popover-container/PopoverContainer'

import css from './OrderTotals.less'

type Props = {
    cart: Maybe<BigCommerceCart>
    currencyCode: string | null
    onUpdateCoupon: (coupon: string) => Promise<void>
    onRemoveCoupon: () => Promise<void>
}

const initialState = { code: '', error: '', isLoading: false }

type ACTION_TYPE =
    | { type: 'SET_CODE'; code: string }
    | { type: 'SET_ERROR'; error: string }
    | { type: 'SET_LOADING'; loading: boolean }

const reducer = (state: typeof initialState, action: ACTION_TYPE) => {
    switch (action.type) {
        case 'SET_CODE':
            // prevent from editing while we're waiting for API
            if (state.isLoading) {
                return state
            }

            return { ...state, code: action.code, error: '' }
        case 'SET_ERROR':
            return { ...state, error: action.error, isLoading: false }
        case 'SET_LOADING':
            return { ...state, isLoading: action.loading }
        default:
            throw new Error()
    }
}

export function Coupon({
    cart,
    currencyCode,
    onUpdateCoupon,
    onRemoveCoupon,
}: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const appliedCoupon = cart?.coupons[0]
    const cartHasCouponApplied = Boolean(appliedCoupon)
    const cartCouponAmount = appliedCoupon?.discounted_amount ?? 0

    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        code: appliedCoupon?.code ?? '',
    })

    const onClose = () => {
        dispatch({ type: 'SET_ERROR', error: '' })
        setIsPopoverOpen(false)
    }

    const onApply = async () => {
        dispatch({ type: 'SET_LOADING', loading: true })

        try {
            await onUpdateCoupon(state.code)
            onClose()
        } catch (error) {
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                onClose()
            } else {
                error instanceof BigCommerceCouponError
                    ? dispatch({ type: 'SET_ERROR', error: error.message })
                    : dispatch({
                          type: 'SET_ERROR',
                          error: BigCommerceCouponErrorMessage.defaultCouponError,
                      })
            }
        } finally {
            dispatch({ type: 'SET_LOADING', loading: false })
        }
    }

    const onRemove = async () => {
        dispatch({ type: 'SET_LOADING', loading: true })

        try {
            await onRemoveCoupon()
            dispatch({ type: 'SET_CODE', code: '' })
            onClose()
        } catch (error) {
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                onClose()
            } else {
                error instanceof BigCommerceCouponError
                    ? dispatch({ type: 'SET_ERROR', error: error.message })
                    : dispatch({
                          type: 'SET_ERROR',
                          error: BigCommerceCouponErrorMessage.defaultCouponError,
                      })
            }
        } finally {
            dispatch({ type: 'SET_LOADING', loading: false })
        }
    }

    const onToggle = () => {
        if (isPopoverOpen) {
            dispatch({ type: 'SET_ERROR', error: '' })
        }
        setIsPopoverOpen((isDropdownOpen) => !isDropdownOpen)
    }

    return (
        <>
            <dt className={css.descriptionTitle}>
                <button
                    onClick={onToggle}
                    className={classnames(css.actionButton)}
                    ref={buttonRef}
                    id="coupon-button"
                >
                    Add coupon code
                </button>
            </dt>
            {appliedCoupon ? (
                <dd className={classnames(css.descriptionExtraInfo)}>
                    {appliedCoupon.code}
                </dd>
            ) : (
                <div />
            )}

            <dd
                className={classnames(css.descriptionValue, {
                    [css.descriptionValueZero]: cartCouponAmount === 0,
                })}
            >
                {state.isLoading && (
                    <div className="mr-3">
                        <LoadingSpinner color="dark" size="small" />
                    </div>
                )}
                <MoneyAmount
                    amount={String(cartCouponAmount)}
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
                    <InputField
                        className={css.couponContainer}
                        label="Coupon code"
                        value={state.code}
                        onChange={(code) =>
                            dispatch({ type: 'SET_CODE', code })
                        }
                        error={state.error}
                        id="coupon-code"
                    />
                }
                footer={
                    <>
                        {cartHasCouponApplied ? (
                            <Button
                                intent="destructive"
                                onClick={onRemove}
                                isLoading={state.isLoading}
                            >
                                Remove
                            </Button>
                        ) : (
                            <Button
                                intent="secondary"
                                onClick={onClose}
                                isDisabled={state.isLoading}
                            >
                                Close
                            </Button>
                        )}
                        <Button onClick={onApply} isLoading={state.isLoading}>
                            Apply
                        </Button>
                    </>
                }
            />
        </>
    )
}
