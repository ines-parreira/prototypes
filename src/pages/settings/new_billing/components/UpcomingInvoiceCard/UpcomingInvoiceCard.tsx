import React, {useState} from 'react'
import moment from 'moment/moment'
import Button from 'pages/common/components/button/Button'
import {CouponSummary, UpcomingInvoiceSummary} from 'models/billing/types'
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
}

export default function UpcomingInvoiceCard({
    isTrialing,
    endOfTrialDatetime,
    endOfCurrentCycleDatetime,
    availableCoupons,
    currentHelpdeskAndAutomateCoupon,
    upcomingInvoice,
}: UpcomingInvoiceCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const dueOn = isTrialing ? (
        <span className={css.caption}>
            Due on {moment(endOfTrialDatetime).format(DATE_FORMAT)}
        </span>
    ) : (
        <span className={css.caption}>
            Due on {moment(endOfCurrentCycleDatetime).format(DATE_FORMAT)}
        </span>
    )

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
            <div>{dueOn}</div>
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
