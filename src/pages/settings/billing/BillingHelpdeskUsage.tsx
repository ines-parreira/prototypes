import React, {useEffect, useMemo} from 'react'
import classnames from 'classnames'
import moment from 'moment'
import {
    Card,
    CardBody,
    CardTitle,
    Progress,
    UncontrolledTooltip,
} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {PlanInterval} from 'models/billing/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCurrentUsage} from 'state/billing/actions'
import {
    getCurrentUsage,
    getIsCurrentHelpdeskLegacy,
    getCurrentHelpdeskFreeTickets,
    getCurrentHelpdeskName,
    getCurrentHelpdeskInterval,
    getIsCurrentHelpdeskCustom,
} from 'state/billing/selectors'
import {getCurrentSubscription} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import LegacyPlanBadge from 'pages/common/components/LegacyPlanBadge'
import LegacyPlanBanner from 'pages/common/components/LegacyPlanBanner'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'
import useAppSelector from 'hooks/useAppSelector'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

import CurrentPlanBadge from './plans/CurrentPlanBadge'

import css from './BillingHelpdeskUsage.less'
import BillingHeader from './common/BillingHeader'

const DATE_FORMAT = 'MMM DD'

const BillingHelpdeskUsage = () => {
    const dispatch = useAppDispatch()
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const currentUsage = useAppSelector(getCurrentUsage)
    const priceName = useAppSelector(getCurrentHelpdeskName)
    const formattedPriceName = convertLegacyPlanNameToPublicPlanName(
        priceName || ''
    )
    const freeTickets = useAppSelector(getCurrentHelpdeskFreeTickets)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const isCustom = useAppSelector(getIsCurrentHelpdeskCustom)

    const hasSubscription = useMemo(
        () => !currentSubscription.isEmpty(),
        [currentSubscription]
    )

    const periodStart = useMemo(
        () =>
            moment(currentUsage.getIn(['meta', 'start_datetime'])).format(
                DATE_FORMAT
            ),
        [currentUsage]
    )

    const periodEnd = useMemo(
        () =>
            moment(currentUsage.getIn(['meta', 'end_datetime'])).format(
                DATE_FORMAT
            ),
        [currentUsage]
    )

    const usedTickets = useMemo(
        () => (currentUsage.getIn(['data', 'tickets']) as number) || 0,
        [currentUsage]
    )

    const extraCost = useMemo(
        () => (currentUsage.getIn(['data', 'cost']) as number) || 0,
        [currentUsage]
    )

    // percentage used/remaining (depends on extra usage)
    const percentUsed = useMemo(
        () =>
            !!freeTickets
                ? usedTickets >= freeTickets
                    ? Math.round((freeTickets * 100) / usedTickets)
                    : Math.round((usedTickets * 100) / freeTickets)
                : 100,
        [freeTickets, usedTickets]
    )

    const percentRemaining = useMemo(
        () => (!!freeTickets ? 100 - percentUsed : 100),
        [freeTickets, percentUsed]
    )

    const isTrialing = useMemo(
        () => currentSubscription.get('status') === 'trialing',
        [currentSubscription]
    )

    const planTitle = useMemo(
        () => `${formattedPriceName} ${interval || PlanInterval.Month}ly plan`,
        [formattedPriceName, interval]
    )

    const currentSubscriptionStart = useMemo(
        () =>
            moment(currentSubscription.get('start_datetime')).format(
                DATE_FORMAT
            ),
        [currentSubscription]
    )

    const currentSubscriptionTrialStart = useMemo(
        () =>
            moment(currentSubscription.get('trial_start_datetime')).format(
                DATE_FORMAT
            ),
        [currentSubscription]
    )

    const currentSubscriptionTrialEnd = useMemo(
        () =>
            moment(currentSubscription.get('trial_end_datetime')).format(
                DATE_FORMAT
            ),
        [currentSubscription]
    )

    const [{loading: isLoading}, handleCurrentUsageFetch] =
        useAsyncFn(async () => {
            try {
                await dispatch(fetchCurrentUsage())
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch current usage',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [])

    useEffect(() => {
        void handleCurrentUsageFetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return isLoading ? (
        <Loader />
    ) : (
        <div className={css.wrapper}>
            {isCurrentHelpdeskLegacy && (
                <LegacyPlanBanner isCustomPrice={isCustom} />
            )}
            <BillingHeader icon="insert_chart">Usage & Plans</BillingHeader>
            <Card
                className={classnames(
                    {[css['card-current-plan']]: hasSubscription},
                    css.card
                )}
            >
                <CardTitle
                    className={classnames(css['card-title'], {
                        [css['current-plan-title']]: hasSubscription,
                        [css[formattedPriceName.toLowerCase()]]:
                            hasSubscription,
                        [css.legacy]: isCurrentHelpdeskLegacy,
                    })}
                >
                    {hasSubscription ? (
                        <>
                            <div className={css.planTitle}>{planTitle}</div>
                            {isCurrentHelpdeskLegacy ? (
                                <LegacyPlanBadge />
                            ) : (
                                <CurrentPlanBadge
                                    className={
                                        css[
                                            `badge-${formattedPriceName.toLowerCase()}`
                                        ]
                                    }
                                />
                            )}
                        </>
                    ) : (
                        'No active plan'
                    )}
                </CardTitle>
                <CardBody
                    data-candu-id={
                        hasSubscription
                            ? 'billing-subscription-usage'
                            : 'billing-trial-usage'
                    }
                    className={css['card-body']}
                >
                    {hasSubscription && (
                        <div className={css['billable-tickets']}>
                            <div className={css['ticket-numbers']}>
                                {usedTickets.toLocaleString()}/
                                {freeTickets.toLocaleString()} tickets{' '}
                                <a id="current-period">
                                    <i className="material-icons text-muted">
                                        info_outline
                                    </i>
                                </a>
                            </div>
                            <UncontrolledTooltip target="current-period">
                                Number of tickets included in your current plan
                                VS total number of tickets used between:
                                <br />
                                {periodStart} and {periodEnd}
                            </UncontrolledTooltip>

                            <Progress multi className={css['usage-progress']}>
                                <Progress
                                    bar
                                    value={percentUsed}
                                    barClassName={classnames(css.progressBar, {
                                        [css.isWarning]:
                                            freeTickets &&
                                            usedTickets >= freeTickets &&
                                            percentRemaining === 0,
                                    })}
                                />
                                {!!freeTickets &&
                                    usedTickets >= freeTickets &&
                                    percentRemaining > 0 && (
                                        <Progress
                                            bar
                                            value={percentRemaining}
                                            barClassName={classnames(
                                                css.remainingProgressBar,
                                                {
                                                    [css.isDanger]:
                                                        percentRemaining >= 20,
                                                }
                                            )}
                                        />
                                    )}
                            </Progress>
                            <div className="flex justify-content-between">
                                <div>${extraCost} extra cost</div>
                                <div>
                                    <strong>Usage reset on:</strong> {periodEnd}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={css.description}>
                        {isTrialing ? (
                            <>
                                Your free trial started on{' '}
                                <strong>{currentSubscriptionTrialStart}</strong>{' '}
                                and will expire on{' '}
                                <strong>{currentSubscriptionTrialEnd}</strong>
                            </>
                        ) : hasSubscription ? (
                            <>
                                Your current subscription started on{' '}
                                <strong>{currentSubscriptionStart}</strong>
                            </>
                        ) : (
                            'Please select a plan before updating you payment method.'
                        )}
                    </div>
                    <Button
                        className={css.action}
                        intent={hasSubscription ? 'primary' : 'secondary'}
                        onClick={() => {
                            history.push('/app/settings/billing/plans')
                        }}
                    >
                        {isTrialing || !hasSubscription
                            ? 'Choose plan'
                            : 'Update plan'}
                    </Button>
                </CardBody>
            </Card>
        </div>
    )
}

export default BillingHelpdeskUsage
