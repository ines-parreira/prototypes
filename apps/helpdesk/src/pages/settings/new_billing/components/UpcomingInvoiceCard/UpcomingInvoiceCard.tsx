import React, { useState } from 'react'

import { DATE_FORMAT } from '@repo/billing'
import moment from 'moment/moment'

import { LegacyButton as Button } from '@gorgias/axiom'

import type {
    CouponSummary,
    UpcomingInvoiceSummary,
} from 'models/billing/types'
import { SubscriptionStatus } from 'models/billing/types'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import { useExtendTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useExtendTrialWithSideEffects'
import { useReactivateTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useReactivateTrialWithSideEffects'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'

import AddSalesCouponModal from '../AddSalesCouponModal'

import css from './UpcomingInvoiceCard.less'

interface UpcomingInvoiceCardProps {
    subscriptionStatus: SubscriptionStatus
    endOfTrialDatetime: string | null
    endOfCurrentCycleDatetime: string
    availableCoupons: string[]
    currentHelpdeskAndAutomateCoupon: CouponSummary | null
    upcomingInvoice: UpcomingInvoiceSummary | null
    hasExtendedTrial: boolean
}

export default function UpcomingInvoiceCard({
    subscriptionStatus,
    endOfTrialDatetime,
    endOfCurrentCycleDatetime,
    availableCoupons,
    currentHelpdeskAndAutomateCoupon,
    upcomingInvoice,
    hasExtendedTrial,
}: UpcomingInvoiceCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const extendTrial = useExtendTrialWithSideEffects()
    const reactivateTrial = useReactivateTrialWithSideEffects()

    // no active subscription
    if (subscriptionStatus === SubscriptionStatus.CANCELED) {
        const inSevenDays = moment().add(7, 'days')

        const reactivateTrialButton = (
            <ConfirmationPopover
                title={<b>Confirm trial reactivation</b>}
                content={
                    <p>
                        Do you want to reactivate trial until{' '}
                        <b>{inSevenDays.format(DATE_FORMAT)}</b>? Note, that
                        once confirmed, the reactivation cannot be undone.
                    </p>
                }
                onConfirm={() => {
                    if (
                        !reactivateTrial.isLoading &&
                        !reactivateTrial.isSuccess
                    ) {
                        reactivateTrial.mutate([])
                    }
                }}
                confirmLabel="Confirm"
                cancelButtonProps={{ intent: 'secondary' }}
                showCancelButton
            >
                {({ uid, onDisplayConfirmation, elementRef }) => (
                    <Button
                        id={uid}
                        ref={elementRef}
                        fillStyle="ghost"
                        intent="primary"
                        size="small"
                        onClick={onDisplayConfirmation}
                        isLoading={
                            reactivateTrial.isLoading ||
                            reactivateTrial.isSuccess
                        }
                    >
                        Reactivate trial
                    </Button>
                )}
            </ConfirmationPopover>
        )

        return (
            <div className={css.container}>
                <div className={css.title}>Next invoice</div>
                <div>
                    <span className={css.total}>$0</span>
                </div>
                <div className={css.verticallyAligned}>
                    <span className={css.caption}>
                        {'No active subscription, '}
                        {hasExtendedTrial ? 'Extended trial' : 'Trial'}{' '}
                        {`ended on ${moment(endOfTrialDatetime).format(
                            DATE_FORMAT,
                        )}`}
                    </span>
                    {hasExtendedTrial ? null : reactivateTrialButton}
                </div>
            </div>
        )
    }

    const isTrialing = subscriptionStatus === SubscriptionStatus.TRIALING

    if (!upcomingInvoice) {
        return <div>No upcoming invoice for now</div>
    }

    const hasACouponApplied =
        upcomingInvoice.subtotal_decimal !== upcomingInvoice.total_decimal

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

    const applyCouponButton = isTrialing ? (
        <Button
            fillStyle="ghost"
            intent="primary"
            size="small"
            onClick={() => {
                setIsModalOpen(true)
            }}
        >
            Apply coupon
        </Button>
    ) : null

    const sevenDaysAfterEndOfTrialDatetime = moment(endOfTrialDatetime).add(
        7,
        'days',
    )
    const extendTrialButton = (
        <ConfirmationPopover
            title={<b>Confirm trial extension</b>}
            content={
                <p>
                    Do you want to extend trial until{' '}
                    <b>
                        {sevenDaysAfterEndOfTrialDatetime.format(DATE_FORMAT)}
                    </b>
                    ? Note, that once confirmed, the extension cannot be undone.
                </p>
            }
            onConfirm={() => {
                extendTrial.mutate([])
            }}
            confirmLabel="Confirm"
            cancelButtonProps={{ intent: 'secondary' }}
            showCancelButton
        >
            {({ uid, onDisplayConfirmation, elementRef }) => (
                <Button
                    id={uid}
                    ref={elementRef}
                    fillStyle="ghost"
                    intent="primary"
                    size="small"
                    onClick={onDisplayConfirmation}
                    isLoading={extendTrial.isLoading || extendTrial.isSuccess}
                >
                    Extend trial
                </Button>
            )}
        </ConfirmationPopover>
    )

    return (
        <div className={css.container}>
            <div className={css.title}>Next invoice</div>
            <div>
                {hasACouponApplied ? (
                    currentHelpdeskAndAutomateCoupon ? (
                        <>
                            <span className={css.subtotal}>
                                {formatAmount(
                                    upcomingInvoice.subtotal_in_cents / 100,
                                )}
                            </span>{' '}
                            <span className={css.total}>
                                {formatAmount(
                                    upcomingInvoice.total_in_cents / 100,
                                )}
                            </span>
                            {' with '}
                            <span className={css.coupon}>
                                {currentHelpdeskAndAutomateCoupon.name}
                            </span>{' '}
                            {editCouponButton}
                        </>
                    ) : (
                        <>
                            <span className={css.subtotal}>
                                {formatAmount(
                                    upcomingInvoice.subtotal_in_cents / 100,
                                )}
                            </span>{' '}
                            <span className={css.total}>
                                {formatAmount(
                                    upcomingInvoice.total_in_cents / 100,
                                )}
                            </span>
                        </>
                    )
                ) : (
                    <>
                        <span className={css.total}>
                            {formatAmount(upcomingInvoice.total_in_cents / 100)}
                        </span>
                        {applyCouponButton}
                    </>
                )}
            </div>
            <div className={css.verticallyAligned}>
                {isTrialing ? (
                    <span className={css.caption}>
                        Due on {moment(endOfTrialDatetime).format(DATE_FORMAT)}
                    </span>
                ) : (
                    <span className={css.caption}>
                        Due on{' '}
                        {moment(endOfCurrentCycleDatetime).format(DATE_FORMAT)}
                    </span>
                )}{' '}
                {isTrialing ? (
                    hasExtendedTrial ? (
                        <span className={css.caption}>with extended trial</span>
                    ) : (
                        extendTrialButton
                    )
                ) : null}
            </div>
            <AddSalesCouponModal
                title={'Apply Helpdesk and AI Agent coupon'}
                onCloseModal={() => {
                    setIsModalOpen(false)
                }}
                isModalOpen={isModalOpen}
                availableCoupons={availableCoupons}
                alreadyAppliedCoupon={currentHelpdeskAndAutomateCoupon?.name}
            />
        </div>
    )
}
