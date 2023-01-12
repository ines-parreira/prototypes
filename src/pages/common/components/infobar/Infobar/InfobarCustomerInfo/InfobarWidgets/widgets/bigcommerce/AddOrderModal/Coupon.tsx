import React, {useReducer, useRef, useState} from 'react'

import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import InputField from 'pages/common/forms/input/InputField'
import Spinner from 'pages/common/components/Spinner'

import {BigCommerceCart} from 'models/integration/types'

import {PopoverContainer} from './components/PopoverContainer'

import css from './OrderTotals.less'
import {useCanViewBigCommerceV1Features} from './utils'

type Props = {
    cart: Maybe<BigCommerceCart>
    currencyCode: string | null
    onUpdateCoupon: (coupon: string) => Promise<void>
    onRemoveCoupon: () => Promise<void>
}

const initialState = {code: '', error: '', isLoading: false}

type ACTION_TYPE =
    | {type: 'SET_CODE'; code: string}
    | {type: 'SET_ERROR'; error: string}
    | {type: 'SET_LOADING'; loading: boolean}

const reducer = (state: typeof initialState, action: ACTION_TYPE) => {
    switch (action.type) {
        case 'SET_CODE':
            // prevent from editing while we're waiting for API
            if (state.isLoading) {
                return state
            }

            return {...state, code: action.code, error: ''}
        case 'SET_ERROR':
            return {...state, error: action.error, isLoading: false}
        case 'SET_LOADING':
            return {...state, isLoading: action.loading}
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
    const canViewBigCommerceV1Features = useCanViewBigCommerceV1Features()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    const appliedCoupon = cart?.coupons[0]
    const cartHasCouponApplied = Boolean(appliedCoupon)
    const cartCouponAmount = appliedCoupon?.discounted_amount ?? 0

    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        code: appliedCoupon?.code ?? '',
    })

    const onClose = () => setIsPopoverOpen(false)

    const onApply = async () => {
        dispatch({type: 'SET_LOADING', loading: true})

        try {
            await onUpdateCoupon(state.code)
            onClose()
            dispatch({type: 'SET_LOADING', loading: false})
        } catch (error) {
            dispatch({type: 'SET_ERROR', error: 'Code is not valid.'})
        }
    }

    const onRemove = async () => {
        onClose()

        dispatch({type: 'SET_LOADING', loading: true})
        await onRemoveCoupon()
        dispatch({type: 'SET_CODE', code: ''})
        dispatch({type: 'SET_LOADING', loading: false})
    }

    const onToggle = () => setIsPopoverOpen((isDropdownOpen) => !isDropdownOpen)

    if (!canViewBigCommerceV1Features) {
        return null
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
                        <Spinner color="dark" width="20px" />
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
                        label="Coupon code"
                        value={state.code}
                        onChange={(code) => dispatch({type: 'SET_CODE', code})}
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
