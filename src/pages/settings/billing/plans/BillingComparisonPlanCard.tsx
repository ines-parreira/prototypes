import React, {ComponentProps, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {fromJS, Map} from 'immutable'

import {
    DEPRECATED_getCurrentPlan,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
    getPlan,
    hasLegacyPlan,
} from 'state/billing/selectors'
import {AccountFeatures} from 'state/currentAccount/types'
import {isFeatureEnabled} from 'utils/account'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import BillingPlanCard from './BillingPlanCard'
import ChangePlanModal from './ChangePlanModal'
import CurrentPlanBadge from './CurrentPlanBadge'
import {PlanCardTheme} from './PlanCard'
import AutomationAmount from './AutomationAmount'
import TotalAmount from './TotalAmount'

import css from './BillingComparisonPlanCard.less'

const countFeatures = (features: AccountFeatures) =>
    Object.values(features).filter(isFeatureEnabled).length

type Props = {
    isUpdating: boolean
    defaultIsPlanChangeModalOpen?: boolean
    onPlanChange?: (isModalAutomationChecked: boolean) => void
    isAutomationChecked: boolean
    onAutomationChange: () => void
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
    isAutomationChecked,
    onAutomationChange,
    ...billingCardProps
}: Props) {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(
        defaultIsPlanChangeModalOpen
    )
    const isLegacyPlan = useSelector(hasLegacyPlan)
    const currentPlan = useSelector(DEPRECATED_getCurrentPlan)
    const regularCurrentPlan = useSelector(getEquivalentRegularCurrentPlan)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    const equivalentAutomationPlan = useSelector(
        getPlan(plan.automation_addon_equivalent_plan!)
    )
    const addOnAmount = equivalentAutomationPlan.get('amount')
        ? Math.abs(equivalentAutomationPlan.get('amount') - plan.amount)
        : '?'

    const [isModalAutomationChecked, setModalIsAutomationChecked] =
        useState(isAutomationChecked)

    useEffect(
        () => setModalIsAutomationChecked(isAutomationChecked),
        [isAutomationChecked]
    )

    const hasLessFeatures =
        regularCurrentPlan &&
        countFeatures(plan.features) <
            countFeatures(
                (
                    regularCurrentPlan.get('features', fromJS({})) as Map<
                        any,
                        any
                    >
                ).toJS()
            )
    const isDowngrade =
        !isCurrentPlan &&
        !currentPlan.isEmpty() &&
        !isLegacyPlan &&
        hasLessFeatures

    const isSwitchingToAutomation =
        isCurrentPlan && !hasAutomationAddOn && isAutomationChecked

    const canChoosePlan =
        !isUpdating && (isSwitchingToAutomation || !isCurrentPlan)

    const switchPlanButtonText = isCurrentPlan
        ? hasAutomationAddOn || (!hasAutomationAddOn && !isAutomationChecked)
            ? 'Current Plan'
            : 'Add to Plan'
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
    ) : isSwitchingToAutomation ? (
        <>
            With <b>self-service</b>, let your customers{' '}
            <b>track their orders, request a return or a cancel</b>, report an
            issue (according to your customized workflows) in a click, 24/7!
            Questions?{' '}
            <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                <b>Get in touch!</b>
            </a>
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
            subHeader={
                <AutomationAmount
                    addOnAmount={addOnAmount}
                    plan={plan}
                    isAutomationChecked={isAutomationChecked}
                    onAutomationChange={onAutomationChange}
                    isIntervalAbbreviated
                />
            }
            footer={
                <>
                    <TotalAmount
                        addOnAmount={addOnAmount}
                        plan={plan}
                        isAutomationChecked={isAutomationChecked}
                    />
                    <Button
                        aria-label={switchPlanButtonText}
                        className={css.footerButton}
                        intent={ButtonIntent.Text}
                        isDisabled={!canChoosePlan}
                        isLoading={isUpdating}
                        onClick={() => {
                            if (canChoosePlan) {
                                setIsPlanChangeModalOpen(!isPlanChangeModalOpen)
                            }
                        }}
                    >
                        {switchPlanButtonText}
                    </Button>
                    <ChangePlanModal
                        header={
                            isLegacyPlan
                                ? 'Switch to our updated plans'
                                : isDowngrade
                                ? 'Are you sure you want to switch plans?'
                                : isSwitchingToAutomation
                                ? 'Leverage the power of automation 👏'
                                : "We're happy to see you grow 👏"
                        }
                        isOpen={canChoosePlan && isPlanChangeModalOpen}
                        isUpdating={isUpdating}
                        onClose={() => {
                            setIsPlanChangeModalOpen(false)
                        }}
                        onConfirm={() => {
                            onPlanChange?.(isModalAutomationChecked)
                            setIsPlanChangeModalOpen(false)
                        }}
                        description={description}
                        renderComparedPlan={({className, renderBody}) => (
                            <BillingPlanCard
                                plan={plan}
                                className={className}
                                renderBody={renderBody}
                                footer={
                                    <>
                                        <AutomationAmount
                                            addOnAmount={addOnAmount}
                                            plan={plan}
                                            isAutomationChecked={
                                                isModalAutomationChecked
                                            }
                                            {...(!isSwitchingToAutomation && {
                                                onAutomationChange: () =>
                                                    setModalIsAutomationChecked(
                                                        !isModalAutomationChecked
                                                    ),
                                            })}
                                        />
                                        <TotalAmount
                                            addOnAmount={addOnAmount}
                                            plan={plan}
                                            isAutomationChecked={
                                                isModalAutomationChecked
                                            }
                                        />
                                    </>
                                }
                            />
                        )}
                        confirmLabel="Confirm"
                    />
                </>
            }
        />
    )
}
