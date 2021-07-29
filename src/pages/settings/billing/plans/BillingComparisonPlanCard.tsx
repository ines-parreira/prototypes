import React, {useState, ComponentProps, MouseEvent} from 'react'
import {Button} from 'reactstrap'
import {useSelector} from 'react-redux'
import {fromJS, Map} from 'immutable'
import classNames from 'classnames'

import {
    getCurrentPlan,
    hasLegacyPlan,
} from '../../../../state/billing/selectors'
import {RootState} from '../../../../state/types'
import {AccountFeatures} from '../../../../state/currentAccount/types'
import {isFeatureEnabled} from '../../../../utils/account'

import {openChat} from '../../../../utils'

import BillingPlanCard from './BillingPlanCard'
import ChangePlanModal from './ChangePlanModal'
import CurrentPlanBadge from './CurrentPlanBadge'
import {PlanCardTheme} from './PlanCard'

const countFeatures = (features: AccountFeatures) =>
    Object.values(features).filter(isFeatureEnabled).length

type Props = {
    isUpdating: boolean
    defaultIsPlanChangeModalOpen?: boolean
    onPlanChange?: () => void
} & Omit<
    ComponentProps<typeof BillingPlanCard>,
    'footer' | 'headerBadge' | 'theme'
>

export default function BillingComparisonPlanCard({
    plan,
    isCurrentPlan,
    isUpdating,
    onPlanChange,
    defaultIsPlanChangeModalOpen = false,
    ...billingCardProps
}: Props) {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(
        defaultIsPlanChangeModalOpen
    )
    const isLegacyPlan = useSelector(hasLegacyPlan)
    const currentPlan = useSelector(getCurrentPlan)
    const currentAccount = useSelector(
        (state: RootState) => state.currentAccount
    )
    const isLegacyCustomPlan =
        currentPlan.get('custom') && !currentPlan.get('public')
    const accountHasLegacyFeatures = currentAccount.getIn(
        ['meta', 'has_legacy_features'],
        false
    )
    const hasLessFeatures =
        countFeatures(plan.features) <
        countFeatures(
            (currentPlan.get(
                accountHasLegacyFeatures ? 'legacy_features' : 'features',
                fromJS({})
            ) as Map<any, any>).toJS()
        )
    const isDowngrade =
        !isCurrentPlan &&
        !currentPlan.isEmpty() &&
        !isLegacyPlan &&
        hasLessFeatures

    const canChoosePlan = !isCurrentPlan && !isUpdating
    const switchPlanButtonText = isCurrentPlan
        ? 'Current Plan'
        : `${
              plan.name === currentPlan.get('name') ||
              (isLegacyPlan && hasLessFeatures)
                  ? 'Switch'
                  : isDowngrade
                  ? 'Downgrade'
                  : 'Upgrade'
          } to ${plan.name} Plan`

    const costMultiplier = 100

    const description = isLegacyPlan ? (
        <>
            Note that upcoming product features will not be available in legacy
            plans. Our new pricing structure includes up to{' '}
            <b>150 integrations</b> for free starting on Basic. Any questions?{' '}
            <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                <b>Get in touch!</b>
            </a>
        </>
    ) : isDowngrade ? (
        <>
            Note that your number of tickets will decrease from{' '}
            <b>{currentPlan.get('free_tickets')}</b> to{' '}
            <b>{plan['free_tickets']}</b> and the extra ticket price will change
            to{' '}
            <b>
                {plan['currencySign']}
                {(plan['cost_per_ticket'] * costMultiplier).toFixed(2)} per
                extra {costMultiplier} tickets
            </b>
            .
        </>
    ) : plan.id.includes('basic') ? (
        <>
            Our Basic plan is perfect for small businesses: centralize all your
            customer conversations, connect your Shopify instantly and add a
            Live Chat! Questions?{' '}
            <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                <b>Get in touch!</b>
            </a>
        </>
    ) : plan.id.includes('pro') ? (
        <>
            Our Pro plan was defined for growing businesses like yours! Use{' '}
            <b>Chat Campaigns</b> & <b>Phone</b> to increase conversion or send{' '}
            <b>Satisfaction Surveys</b> to monitor support quality. Any
            questions?{' '}
            <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                <b>Get in touch!</b>
            </a>
        </>
    ) : (
        <>
            Our Advanced plan is suited for established stores: organise your
            helpdesk with <b>View Sections</b>, add <b>more Phone lines</b> and
            measure profits with <b>Revenue Statistics</b>. Questions?{' '}
            <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                <b>Get in touch!</b>
            </a>
        </>
    )

    return (
        <BillingPlanCard
            {...billingCardProps}
            plan={plan}
            isCurrentPlan={isCurrentPlan}
            theme={isCurrentPlan ? PlanCardTheme.Grey : undefined}
            headerBadge={
                isCurrentPlan && <CurrentPlanBadge planName={plan.name} />
            }
            footer={
                isLegacyCustomPlan ? (
                    <Button
                        aria-label="Contact us"
                        color="link"
                        onClick={(event: MouseEvent) => {
                            openChat(event)
                        }}
                    >
                        Contact us
                    </Button>
                ) : (
                    <>
                        <Button
                            aria-label={switchPlanButtonText}
                            className={classNames({
                                'btn-loading': isUpdating,
                            })}
                            color="link"
                            disabled={!canChoosePlan}
                            onClick={() => {
                                if (canChoosePlan) {
                                    setIsPlanChangeModalOpen(
                                        !isPlanChangeModalOpen
                                    )
                                }
                            }}
                        >
                            {switchPlanButtonText}
                        </Button>
                        <ChangePlanModal
                            currentPlan={currentPlan}
                            header={
                                isLegacyPlan
                                    ? 'Switch to our updated plans'
                                    : isDowngrade
                                    ? 'Are you sure you want to switch plans?'
                                    : "We're happy to see you grow 👏"
                            }
                            isOpen={canChoosePlan && isPlanChangeModalOpen}
                            isUpdating={isUpdating}
                            onClose={() => {
                                setIsPlanChangeModalOpen(false)
                            }}
                            onConfirm={() => {
                                onPlanChange?.()
                                setIsPlanChangeModalOpen(false)
                            }}
                            description={description}
                            renderComparedPlan={({className, renderBody}) => (
                                <BillingPlanCard
                                    plan={plan}
                                    className={className}
                                    renderBody={renderBody}
                                />
                            )}
                            confirmLabel="Confirm"
                        />
                    </>
                )
            }
        />
    )
}
