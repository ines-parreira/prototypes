import React, {ComponentProps, useEffect, useMemo, useState} from 'react'

import {
    getAutomationPricesMap,
    getCurrentHelpdeskProduct,
    getHasAutomationAddOn,
    getIsCurrentHelpdeskLegacy,
} from 'state/billing/selectors'
import {AccountFeatures} from 'state/currentAccount/types'
import {isFeatureEnabled} from 'utils/account'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import {HelpdeskPrice} from 'models/billing/types'
import {getFormattedAmount, getFullPrice} from 'models/billing/utils'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

import BillingPlanCard from './BillingPlanCard'
import ChangePlanModal from './ChangePlanModal'
import CurrentPlanBadge from './CurrentPlanBadge'
import {PlanCardTheme} from './PlanCard'
import AutomationAmount from './AutomationAmount'
import TotalAmount from './TotalAmount'
import css from './BillingComparisonPlanCard.less'
import {getPlanCardFeaturesForPrices} from './billingPlanFeatures'

const countFeatures = (features: AccountFeatures) =>
    Object.values(features).filter(isFeatureEnabled).length

type Props = {
    helpdeskPrice: HelpdeskPrice
    isUpdating: boolean
    defaultIsPlanChangeModalOpen?: boolean
    onPlanChange?: (isModalAutomationChecked: boolean) => void
    isAutomationChecked: boolean
    onAutomationChange: () => void
} & Omit<
    ComponentProps<typeof BillingPlanCard>,
    | 'footer'
    | 'headerBadge'
    | 'theme'
    | 'featuresPlan'
    | 'name'
    | 'amount'
    | 'interval'
    | 'features'
    | 'currency'
>

export default function BillingComparisonPlanCard({
    helpdeskPrice,
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
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const automationPricesMap = useAppSelector(getAutomationPricesMap)
    const automationPrice = useMemo(() => {
        const automationPriceId = helpdeskPrice.addons?.find(
            (addonId) => !!automationPricesMap[addonId]
        )

        if (automationPriceId) {
            return automationPricesMap[automationPriceId]
        }
    }, [automationPricesMap, helpdeskPrice])
    const currentHelpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const formattedName = convertLegacyPlanNameToPublicPlanName(
        helpdeskPrice.name
    )

    const addOnAmount = automationPrice
        ? getFormattedAmount(automationPrice.amount)
        : undefined

    const addOnDiscount = automationPrice?.automation_addon_discount

    const fullAddOnAmount = useMemo(() => {
        return typeof addOnAmount === 'number' && addOnDiscount
            ? getFullPrice(addOnAmount, addOnDiscount)
            : undefined
    }, [addOnAmount, addOnDiscount])

    const [isModalAutomationChecked, setModalIsAutomationChecked] =
        useState(isAutomationChecked)

    useEffect(
        () => setModalIsAutomationChecked(isAutomationChecked),
        [isAutomationChecked]
    )

    const hasLessFeatures =
        currentHelpdeskPrice &&
        countFeatures(helpdeskPrice.features) <
            countFeatures(currentHelpdeskPrice.features)
    const isDowngrade =
        !isCurrentPlan &&
        currentHelpdeskPrice &&
        !isCurrentHelpdeskLegacy &&
        hasLessFeatures

    const isSwitchingToAutomation =
        isCurrentPlan &&
        !hasAutomationAddOn &&
        isAutomationChecked &&
        automationPrice != null

    const canChoosePlan =
        !isUpdating && (isSwitchingToAutomation || !isCurrentPlan)

    const switchPlanButtonText = isCurrentPlan
        ? hasAutomationAddOn ||
          (!hasAutomationAddOn && !isAutomationChecked) ||
          automationPrice == null
            ? 'Current Plan'
            : 'Add to Plan'
        : `${
              formattedName === currentHelpdeskPrice?.name ||
              (isCurrentHelpdeskLegacy && hasLessFeatures)
                  ? 'Switch'
                  : isDowngrade
                  ? 'Downgrade'
                  : 'Upgrade'
          } to ${formattedName} Plan`

    const costMultiplier = 100

    const description = isCurrentHelpdeskLegacy ? (
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
            <b>{currentHelpdeskPrice?.free_tickets}</b> to{' '}
            <b>{helpdeskPrice.free_tickets}</b> and the extra ticket price will
            change to{' '}
            <b>
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: helpdeskPrice.currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(helpdeskPrice.cost_per_ticket * costMultiplier)}{' '}
                per extra {costMultiplier} tickets
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
    ) : formattedName.toLocaleLowerCase().includes('basic') ? (
        <>
            Our Basic plan is perfect for small businesses: centralize all your
            customer conversations, connect your Shopify instantly and add a
            Live Chat! Questions?{' '}
            <a href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}>
                <b>Get in touch!</b>
            </a>
        </>
    ) : formattedName.toLocaleLowerCase().includes('pro') ? (
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
    const features = useMemo(
        () =>
            getPlanCardFeaturesForPrices(
                [helpdeskPrice],
                !(isCurrentPlan && isCurrentHelpdeskLegacy)
            ),
        [helpdeskPrice, isCurrentHelpdeskLegacy, isCurrentPlan]
    )
    const automationFeatures = useMemo(
        () =>
            automationPrice &&
            getPlanCardFeaturesForPrices(
                [helpdeskPrice, automationPrice],
                !(isCurrentPlan && isCurrentHelpdeskLegacy)
            ),
        [automationPrice, helpdeskPrice, isCurrentHelpdeskLegacy, isCurrentPlan]
    )
    const isEditable = useMemo(() => addOnAmount != null, [addOnAmount])

    return (
        <BillingPlanCard
            {...billingCardProps}
            isCurrentPlan={isCurrentPlan}
            theme={isCurrentPlan ? PlanCardTheme.Grey : undefined}
            headerBadge={
                isCurrentPlan && <CurrentPlanBadge planName={formattedName} />
            }
            amount={getFormattedAmount(helpdeskPrice.amount)}
            currency={helpdeskPrice.currency}
            interval={helpdeskPrice.interval}
            name={formattedName}
            features={features}
            subHeader={
                <AutomationAmount
                    addOnAmount={addOnAmount}
                    currency={helpdeskPrice.currency}
                    fullAddOnAmount={fullAddOnAmount}
                    interval={helpdeskPrice.interval}
                    isAutomationChecked={isAutomationChecked}
                    onAutomationChange={onAutomationChange}
                    isIntervalAbbreviated
                    editable={isEditable}
                />
            }
            footer={
                <>
                    <TotalAmount
                        addOnAmount={addOnAmount}
                        amount={getFormattedAmount(helpdeskPrice.amount)}
                        currency={helpdeskPrice.currency}
                        interval={helpdeskPrice.interval}
                        isAutomationChecked={isAutomationChecked}
                    />
                    <Button
                        aria-label={switchPlanButtonText}
                        className={css.footerButton}
                        fillStyle="ghost"
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
                            isCurrentHelpdeskLegacy
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
                                amount={getFormattedAmount(
                                    helpdeskPrice.amount
                                )}
                                currency={helpdeskPrice.currency}
                                interval={helpdeskPrice.interval}
                                name={formattedName}
                                features={
                                    isModalAutomationChecked &&
                                    automationFeatures
                                        ? automationFeatures
                                        : features
                                }
                                className={className}
                                renderBody={renderBody}
                                footer={
                                    <>
                                        <AutomationAmount
                                            addOnAmount={addOnAmount}
                                            currency={helpdeskPrice.currency}
                                            fullAddOnAmount={fullAddOnAmount}
                                            interval={helpdeskPrice.interval}
                                            isAutomationChecked={
                                                isModalAutomationChecked
                                            }
                                            editable={isEditable}
                                            {...(!isSwitchingToAutomation && {
                                                onAutomationChange: () =>
                                                    setModalIsAutomationChecked(
                                                        !isModalAutomationChecked
                                                    ),
                                            })}
                                        />
                                        <TotalAmount
                                            addOnAmount={addOnAmount}
                                            amount={getFormattedAmount(
                                                helpdeskPrice.amount
                                            )}
                                            currency={helpdeskPrice.currency}
                                            interval={helpdeskPrice.interval}
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
