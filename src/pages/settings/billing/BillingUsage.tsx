import React, {useCallback, useEffect} from 'react'
import classnames from 'classnames'
import moment from 'moment'
import {
    Card,
    CardBody,
    CardGroup,
    CardTitle,
    Progress,
    UncontrolledTooltip,
} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {PlanInterval} from 'models/billing/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCurrentUsage} from 'state/billing/actions'
import {openChat} from 'utils'
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

import AutomationSection from './automation/AutomationSection'
import CurrentPlanBadge from './plans/CurrentPlanBadge'

import css from './BillingUsage.less'
import BillingHeader from './common/BillingHeader'

const BillingUsage = () => {
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

    const renderTicketUsage = useCallback(() => {
        const dateFormat = 'MMM DD'
        const periodStart = moment(
            currentUsage.getIn(['meta', 'start_datetime'])
        ).format(dateFormat)
        const periodEnd = moment(
            currentUsage.getIn(['meta', 'end_datetime'])
        ).format(dateFormat)

        const usedTickets =
            (currentUsage.getIn(['data', 'tickets']) as number) || 0
        const extraCost = (currentUsage.getIn(['data', 'cost']) as number) || 0

        // percentage used/remaining (depends on extra usage)
        let percentUsed = 100
        let percentRemaining = 100

        if (freeTickets) {
            if (usedTickets >= freeTickets) {
                percentUsed = Math.round((freeTickets * 100) / usedTickets)
                percentRemaining = 100 - percentUsed
            } else {
                // we're still in the "no extra usage" zone of included tickets in the helpdesk
                percentUsed = Math.round((usedTickets * 100) / freeTickets)
                percentRemaining = 100 - percentUsed
            }
        }

        return (
            <div>
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
                    Number of tickets included in your current plan VS total
                    number of tickets used between:
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
                                        [css.isDanger]: percentRemaining >= 20,
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
        )
    }, [freeTickets, currentUsage])

    const renderNoSubscription = () => (
        <CardGroup className={css['card-group']}>
            <Card>
                <CardTitle
                    className={classnames(css['card-title'], css['Missing'])}
                >
                    No active plan
                </CardTitle>
                <CardBody
                    data-candu-id="billing-trial-usage"
                    className={css['card-body']}
                >
                    <div className={css.description}>
                        Please select a plan before updating you payment method.
                        <Button
                            intent="secondary"
                            onClick={() => {
                                history.push('/app/settings/billing/plans')
                            }}
                        >
                            Choose Plan
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </CardGroup>
    )

    const renderActiveSubscription = () => {
        const dateFormat = 'MMM DD'

        const isTrialing = currentSubscription.get('status') === 'trialing'
        const planTitle = `${formattedPriceName} ${
            interval || PlanInterval.Month
        }ly plan`

        const currentSubscriptionStart = moment(
            currentSubscription.get('start_datetime')
        ).format(dateFormat)
        const currentSubscriptionTrialStart = moment(
            currentSubscription.get('trial_start_datetime')
        ).format(dateFormat)
        const currentSubscriptionTrialEnd = moment(
            currentSubscription.get('trial_end_datetime')
        ).format(dateFormat)

        return (
            <CardGroup className={css['card-group']}>
                <Card
                    className={classnames(css['card-current-plan'], css.card)}
                >
                    <CardTitle
                        className={classnames(
                            css['card-title'],
                            css['current-plan-title'],
                            css[formattedPriceName.toLowerCase()],
                            {
                                [css.legacy]: isCurrentHelpdeskLegacy,
                            }
                        )}
                    >
                        <div className={css.planTitle}>{planTitle}</div>
                        {isCurrentHelpdeskLegacy ? (
                            <LegacyPlanBadge />
                        ) : (
                            <CurrentPlanBadge planName={formattedPriceName} />
                        )}
                    </CardTitle>
                    <CardBody
                        data-candu-id="billing-subscription-usage"
                        className={css['card-body']}
                    >
                        {renderTicketUsage()}
                        <div className={css.description}>
                            {isTrialing ? (
                                <div>
                                    Your free trial started on{' '}
                                    <strong>
                                        {currentSubscriptionTrialStart}
                                    </strong>{' '}
                                    and will expire on{' '}
                                    <strong>
                                        {currentSubscriptionTrialEnd}
                                    </strong>
                                </div>
                            ) : (
                                <div>
                                    Your current subscription started on{' '}
                                    <strong>{currentSubscriptionStart}</strong>
                                </div>
                            )}
                            <Button
                                onClick={() => {
                                    history.push('/app/settings/billing/plans')
                                }}
                            >
                                {isTrialing ? 'Choose plan' : 'Update plan'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
                <AutomationSection />
            </CardGroup>
        )
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className={css.wrapper}>
            {isCurrentHelpdeskLegacy && (
                <LegacyPlanBanner isCustomPlan={isCustom} />
            )}
            <BillingHeader icon="insert_chart">Usage & Plans</BillingHeader>

            {currentSubscription.isEmpty()
                ? renderNoSubscription()
                : renderActiveSubscription()}

            <p>
                If you have any questions or if you want to unsubscribe, please
                contact us at{' '}
                <a
                    className={css.link}
                    href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}
                >
                    {window.GORGIAS_SUPPORT_EMAIL}
                </a>{' '}
                or{' '}
                <a className={css.link} href="" onClick={openChat}>
                    Live Chat
                </a>
                .
            </p>
        </div>
    )
}

export default BillingUsage
