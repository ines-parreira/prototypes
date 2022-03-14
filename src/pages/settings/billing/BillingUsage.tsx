import React, {useCallback, useEffect} from 'react'
import classnames from 'classnames'
import moment from 'moment'
import {Link} from 'react-router-dom'
import {
    Card,
    CardBody,
    CardGroup,
    CardTitle,
    Progress,
    UncontrolledTooltip,
} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCurrentUsage} from 'state/billing/actions'
import {openChat} from 'utils'
import {getCurrentUsage, getPlan, hasLegacyPlan} from 'state/billing/selectors'
import {getCurrentSubscription} from 'state/currentAccount/selectors'
import {getActiveIntegrations} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import LegacyPlanBadge from 'pages/common/components/LegacyPlanBadge'
import LegacyPlanBanner from 'pages/common/components/LegacyPlanBanner'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'
import useAppSelector from 'hooks/useAppSelector'

import AutomationSection from './automation/AutomationSection'
import CurrentPlanBadge from './plans/CurrentPlanBadge'

import css from './BillingUsage.less'
import BillingHeader from './common/BillingHeader'

const BillingUsage = () => {
    const dispatch = useAppDispatch()

    const accountHasLegacyPlan = useAppSelector(hasLegacyPlan)
    const activeIntegrations = useAppSelector(getActiveIntegrations)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const currentPlan = useAppSelector(getPlan(currentSubscription.get('plan')))
    const currentUsage = useAppSelector(getCurrentUsage)

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
    }, [])

    const renderTicketUsage = useCallback(() => {
        const dateFormat = 'MMM DD'
        const periodStart = moment(
            currentUsage.getIn(['meta', 'start_datetime'])
        ).format(dateFormat)
        const periodEnd = moment(
            currentUsage.getIn(['meta', 'end_datetime'])
        ).format(dateFormat)

        // tickets included/used + extra cost
        const includedTickets = (currentPlan.get('free_tickets') as number) || 0
        const usedTickets =
            (currentUsage.getIn(['data', 'tickets']) as number) || 0
        const extraCost = (currentUsage.getIn(['data', 'cost']) as number) || 0

        // percentage used/remaining (depends on extra usage)
        let percentUsed = 100
        let percentRemaining = 100

        if (includedTickets) {
            if (usedTickets >= includedTickets) {
                percentUsed = Math.round((includedTickets * 100) / usedTickets)
                percentRemaining = 100 - percentUsed
            } else {
                // we're still in the "no extra usage" zone of included tickets in the helpdesk
                percentUsed = Math.round((usedTickets * 100) / includedTickets)
                percentRemaining = 100 - percentUsed
            }
        }

        return (
            <div>
                <div className={css['ticket-numbers']}>
                    {usedTickets.toLocaleString()}/
                    {includedTickets.toLocaleString()} tickets{' '}
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
                                includedTickets &&
                                usedTickets >= includedTickets &&
                                percentRemaining === 0,
                        })}
                    />
                    {!!includedTickets &&
                        usedTickets >= includedTickets &&
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
    }, [currentPlan, currentUsage])

    const renderIntegrationUsage = useCallback(() => {
        // integrations included/used
        const includedIntegrations = currentPlan.get('integrations')
        const usedIntegrations = activeIntegrations
            ? activeIntegrations.size
            : 0

        return (
            <div className={css['integration-numbers']}>
                {usedIntegrations}/{includedIntegrations}{' '}
                <b>
                    <Link className={css.link} to="/app/settings/integrations">
                        integrations
                    </Link>
                </b>{' '}
                <a id="integrations-consumed">
                    <i className="material-icons text-muted">info_outline</i>
                </a>
                <UncontrolledTooltip target="integrations-consumed">
                    Number of integrations used VS total number of integrations
                    available for your current plan.
                </UncontrolledTooltip>
            </div>
        )
    }, [activeIntegrations, currentPlan])

    const renderNoSubscription = () => (
        <CardGroup className={css['card-group']}>
            <Card>
                <CardTitle
                    className={classnames(css['card-title'], css['Missing'])}
                >
                    No active plan
                </CardTitle>
                <CardBody className={css['card-body']}>
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
        const planName = currentPlan.get('name') as string
        const planTitle = `${planName} ${
            currentPlan.get('interval') as string
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
                            css[planName.toLowerCase()],
                            {
                                [css.legacy]: accountHasLegacyPlan,
                            }
                        )}
                    >
                        <div className={css.planTitle}>{planTitle}</div>
                        {accountHasLegacyPlan ? (
                            <LegacyPlanBadge />
                        ) : (
                            <CurrentPlanBadge planName={planName} />
                        )}
                    </CardTitle>
                    <CardBody className={css['card-body']}>
                        {renderTicketUsage()}
                        {renderIntegrationUsage()}
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
            {accountHasLegacyPlan && (
                <LegacyPlanBanner isCustomPlan={currentPlan.get('custom')} />
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
