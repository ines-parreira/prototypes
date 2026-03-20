import React, { useState } from 'react'

import _capitalize from 'lodash/capitalize'
import moment from 'moment/moment'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { CouponSummary, Plan } from 'models/billing/types'
import { getPlanDescription } from 'models/billing/utils'

import { DATE_FORMAT } from '../../constants'
import AddSalesCouponModal from '../AddSalesCouponModal'

import css from './ProductCardForCoupon.less'

interface ProductCardForCouponProps {
    productName: string
    isTrialing: boolean
    endOfTrialDatetime: string | null
    currentCoupon: CouponSummary | null
    availableCoupons?: string[]
    plan: Plan | null
    canApplyProductCoupon: boolean
}

export default function ProductCardForCoupon({
    productName,
    isTrialing,
    endOfTrialDatetime,
    currentCoupon,
    plan,
    canApplyProductCoupon,
    availableCoupons = [],
}: ProductCardForCouponProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (!plan) {
        return (
            <div className={css.container}>
                <div className={css.inactiveProduct}>
                    <div className={css.title}>{productName}</div>
                    <div>
                        <span className={css.bold}>Status: </span>
                        <span>Inactive</span>
                    </div>
                    <div>
                        <span className={css.bold}>Billing frequency: </span>
                        <span>-</span>
                    </div>
                    <div>
                        <span className={css.bold}>Plan: </span>
                        <span>-</span>
                    </div>
                </div>
            </div>
        )
    }

    const status = isTrialing ? (
        <>
            <span>Free trial ends on </span>
            <span className={css.bold}>
                {moment(endOfTrialDatetime).format(DATE_FORMAT)}
            </span>
        </>
    ) : (
        <span>Active</span>
    )

    const editCouponButton = isTrialing ? (
        <Button
            fillStyle="ghost"
            intent="primary"
            size="small"
            onClick={() => {
                setIsModalOpen(true)
            }}
        >
            Edit coupon
        </Button>
    ) : null

    const applyCouponButton =
        isTrialing && canApplyProductCoupon ? (
            <Button
                fillStyle="ghost"
                intent="primary"
                size="small"
                onClick={() => {
                    setIsModalOpen(true)
                }}
            >
                Apply {productName} coupon
            </Button>
        ) : null

    return (
        <div className={css.container}>
            <div className={css.title}>{productName}</div>
            <div>
                <span className={css.bold}>Status: </span>
                {status}
            </div>
            <div>
                <span className={css.bold}>Billing frequency: </span>
                <span>{_capitalize(plan.cadence)}ly</span>
            </div>
            <div>
                <span className={css.bold}>Plan: </span>
                <span className={css.bold}>{plan.plan_id}</span>-{' '}
                <span>{getPlanDescription(plan)}</span>
            </div>
            <div className={css.verticallyAligned}>
                <span className={css.bold}>Discount coupon: </span>
                {currentCoupon ? (
                    <>
                        <span>{currentCoupon.name}</span>
                        {editCouponButton}
                    </>
                ) : (
                    <span>Not applied</span>
                )}
                {applyCouponButton}
            </div>
            <AddSalesCouponModal
                title={`Apply ${productName} coupon`}
                onCloseModal={() => {
                    setIsModalOpen(false)
                }}
                isModalOpen={isModalOpen}
                availableCoupons={availableCoupons}
                alreadyAppliedCoupon={currentCoupon?.name}
            />
        </div>
    )
}
