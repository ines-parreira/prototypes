import React, {useState} from 'react'
import moment from 'moment/moment'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import Button from 'pages/common/components/button/Button'
import {CouponSummary, UpcomingInvoiceSummary} from 'models/billing/types'
import {useExtendTrialWithSideEffects} from 'pages/settings/new_billing/hooks/useExtendTrialWithSideEffects'
import AddSalesCouponModal from '../AddSalesCouponModal'
import {DATE_FORMAT} from '../../constants'
import css from './UpcomingInvoiceCard.less'

interface UpcomingInvoiceCardProps {
    isTrialing: boolean
    endOfTrialDatetime: string | null
    endOfCurrentCycleDatetime: string
    availableCoupons: string[]
    currentHelpdeskAndAutomateCoupon: CouponSummary | null
    upcomingInvoice: UpcomingInvoiceSummary | null
    hasExtendedTrial: boolean
}

export default function UpcomingInvoiceCard({
    isTrialing,
    endOfTrialDatetime,
    endOfCurrentCycleDatetime,
    availableCoupons,
    currentHelpdeskAndAutomateCoupon,
    upcomingInvoice,
    hasExtendedTrial,
}: UpcomingInvoiceCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const extendTrial = useExtendTrialWithSideEffects()

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
        'days'
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
            cancelButtonProps={{intent: 'secondary'}}
            showCancelButton
        >
            {({uid, onDisplayConfirmation, elementRef}) => (
                <Button
                    id={uid}
                    ref={elementRef}
                    fillStyle="ghost"
                    intent="primary"
                    size="small"
                    onClick={onDisplayConfirmation}
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
                                ${upcomingInvoice.subtotal_decimal}
                            </span>{' '}
                            <span className={css.total}>
                                ${upcomingInvoice.total_decimal}
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
                                ${upcomingInvoice.subtotal_decimal}
                            </span>{' '}
                            <span className={css.total}>
                                ${upcomingInvoice.total_decimal}
                            </span>
                        </>
                    )
                ) : (
                    <>
                        <span className={css.total}>
                            ${upcomingInvoice.total_decimal}
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
                title={'Apply Helpdesk and Automate coupon'}
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
