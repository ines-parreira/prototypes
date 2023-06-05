import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import {
    getCurrentSubscription,
    isTrialing,
} from 'state/currentAccount/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCurrentAutomationProduct,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskProduct,
    getCurrentSMSProduct,
    getCurrentUsage,
    getCurrentVoiceProduct,
} from 'state/billing/selectors'
import {ProductType} from 'models/billing/types'
import {openChat} from 'utils'
import {BILLING_PAYMENT_PATH, DATE_FORMAT} from '../../constants'
import ProductCard from '../../components/ProductCard'
import css from './UsageAndPlansView.less'

const UsageAndPlansView = () => {
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const currentUsage = useAppSelector(getCurrentUsage)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const voiceProduct = useAppSelector(getCurrentVoiceProduct)
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const automationProduct = useAppSelector(getCurrentAutomationProduct)
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)

    const isIntervalMonthly = interval === 'month'

    const isTrialingSubscription = useAppSelector(isTrialing)
    const hasSubscription = useMemo(
        () => !currentSubscription.isEmpty(),
        [currentSubscription]
    )

    const periodEnd = useMemo(
        () =>
            moment(currentUsage.getIn(['meta', 'end_datetime'])).format(
                DATE_FORMAT
            ),
        [currentUsage]
    )

    const trialPeriodStart = useMemo(
        () =>
            moment(currentSubscription.get('trial_start_datetime')).format(
                DATE_FORMAT
            ),
        [currentSubscription]
    )

    const trialPeriodEnd = useMemo(
        () =>
            moment(currentSubscription.get('trial_end_datetime')).format(
                DATE_FORMAT
            ),
        [currentSubscription]
    )

    return (
        <div className={css.container}>
            <div className={css.generalInfo}>
                <div className={css.generalInfoItem}>
                    {isTrialingSubscription ? (
                        <>
                            Your free trial started on{' '}
                            <span>{trialPeriodStart}</span> and will expire on{' '}
                            <span>{trialPeriodEnd}</span>
                        </>
                    ) : hasSubscription ? (
                        <>
                            Your subscription will be renewed on{' '}
                            <span>{periodEnd}</span>
                        </>
                    ) : (
                        <>
                            Your trial has ended. Please{' '}
                            <Link
                                className={css.trialEndedAnchor}
                                to={BILLING_PAYMENT_PATH}
                            >
                                add a payment method
                            </Link>{' '}
                            and select a plan to continue using Gorgias.
                        </>
                    )}
                </div>
                <div className={css.generalInfoItem}>
                    <span>
                        Billed {isIntervalMonthly ? <>Monthly</> : <>Yearly</>}
                    </span>
                    <a href="#">Update</a>
                </div>
            </div>
            <div className={css.productsGridContainer}>
                <ProductCard
                    type={ProductType.Helpdesk}
                    product={helpdeskProduct}
                />
                <ProductCard
                    type={ProductType.Automation}
                    product={automationProduct}
                />
                <ProductCard type={ProductType.Voice} product={voiceProduct} />
                <ProductCard type={ProductType.SMS} product={smsProduct} />
            </div>
            <div className={css.unsubscribe}>
                If you have any questions or if you want to unsubscribe, please
                contact us at{' '}
                <a href="mailto:billing@gorgias.com">billing@gorgias.com</a> or{' '}
                <a href="" onClick={openChat}>
                    Live Chat
                </a>
                .
            </div>
            <div
                className={css.canduContainer}
                data-candu-id="billing-main-content"
            ></div>
        </div>
    )
}

export default UsageAndPlansView
