import React, { useMemo } from 'react'

import { DATE_FORMAT } from '@repo/billing'
import classNames from 'classnames'
import moment from 'moment/moment'

import css from './ScheduledCancellationSummary.less'

type ScheduledCancellationSummaryProps = {
    cancelledProducts: string[]
    scheduledToCancelAt: string
    onContactUs: () => void
}
const ScheduledCancellationSummary = ({
    cancelledProducts,
    scheduledToCancelAt,
    onContactUs,
}: ScheduledCancellationSummaryProps) => {
    const scheduledToCancelAtDate = useMemo(
        () => moment(scheduledToCancelAt).format(DATE_FORMAT),
        [scheduledToCancelAt],
    )
    const [joinedProducts, lastProduct] = useMemo(() => {
        const lastProduct = cancelledProducts[cancelledProducts.length - 1]
        const joinedProducts = cancelledProducts.slice(0, -1).join(', ')
        return [joinedProducts, lastProduct] as const
    }, [cancelledProducts])

    const renderCancelledProducts = () => {
        if (cancelledProducts.length === 1) {
            return (
                <span className="body-semibold text-capitalize">
                    {lastProduct}
                </span>
            )
        }
        return (
            <>
                <span className="body-semibold text-capitalize">
                    {joinedProducts}
                </span>{' '}
                and{' '}
                <span className="body-semibold text-capitalize">
                    {lastProduct}
                </span>
            </>
        )
    }
    return (
        <div className={css.container}>
            <div className={css.content}>
                <span>
                    Your {renderCancelledProducts()} auto-renewal has been
                    cancelled.
                </span>
                <span>
                    {`You'll continue to have full access to all your active products until the end of your billing cycle on `}
                    <span className="body-semibold">
                        {scheduledToCancelAtDate}
                    </span>
                    .
                </span>
                <span>
                    {`If you'd like to reactivate your subscription, please `}
                    <span
                        onClick={onContactUs}
                        className={classNames('text-primary', css.contactUs)}
                    >
                        contact us
                    </span>
                    .
                </span>
            </div>
        </div>
    )
}

export default ScheduledCancellationSummary
