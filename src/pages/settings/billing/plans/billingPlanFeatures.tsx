import _pickBy from 'lodash/pickBy'
import React from 'react'

import magentoIcon from 'assets/img/integrations/magento2-mono.svg'

import {
    AutomationPrice,
    AutomationPriceFeatures,
    HelpdeskPrice,
    HelpdeskPriceFeatures,
} from 'models/billing/types'
import {isHelpdeskPrice} from 'models/billing/utils'
import {isFeatureEnabled} from '../../../../utils/account'
import {
    AccountFeature,
    AccountFeatures,
} from '../../../../state/currentAccount/types'
import {PlanWithCurrencySign} from '../../../../state/billing/types'

import {PlanCardFeature} from './PlanCard'
import BillableTicketsLabel from './BillableTicketsLabel'
import HelpCenterLabel from './HelpCenterLabel'
import PlanFeatureMaterialIcon from './PlanFeatureMaterialIcon'
import PlanFeatureVectorIcon from './PlanFeatureVectorIcon'

type GetCommonPlanCardFeaturesArgs = {
    planId: string
    planName: string
    enableHardCodedFeatures: boolean
    enabledFeatures: AccountFeature[]
    phoneNumbersLimit?: number
    isCustom?: boolean
}

const getCommonPlanCardFeatures = ({
    planId,
    planName,
    enableHardCodedFeatures,
    enabledFeatures,
    phoneNumbersLimit,
    isCustom = false,
}: GetCommonPlanCardFeaturesArgs): PlanCardFeature[] => {
    const hasPhone = enabledFeatures.includes(AccountFeature.PhoneNumber)

    return [
        {
            label: `Facebook, Messenger, Instagram${
                enableHardCodedFeatures ? ' & DMs' : ''
            }`,
            icon: <PlanFeatureMaterialIcon icon="thumb_up" />,
        },
        {
            label: 'Live chat',
            icon: <PlanFeatureMaterialIcon icon="forum" />,
        },
        {
            label: hasPhone ? (
                phoneNumbersLimit ? (
                    <>
                        <b>{phoneNumbersLimit}</b> Phone number
                        {phoneNumbersLimit > 1 && 's'}
                    </>
                ) : (
                    'Custom limit of phone numbers'
                )
            ) : (
                'Phone'
            ),
            icon: <PlanFeatureMaterialIcon icon="phone" />,
            isDisabled: !hasPhone,
        },
        {
            label: 'Macros and rules',
            icon: <PlanFeatureMaterialIcon icon="auto_awesome" />,
        },
        {
            label: 'Satisfaction surveys',
            icon: <PlanFeatureMaterialIcon icon="insert_emoticon" />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.SatisfactionSurveys
            ),
        },
        {
            label: (
                <HelpCenterLabel
                    disabled={
                        !enabledFeatures.includes(AccountFeature.HelpCenter)
                    }
                />
            ),
            icon: <PlanFeatureMaterialIcon icon="web_asset" />,
            isDisabled: !enabledFeatures.includes(AccountFeature.HelpCenter),
        },
        planId === 'enterprise' || planName === 'Advanced' || isCustom
            ? {
                  label: (
                      <>
                          <b>Full</b> onboarding
                      </>
                  ),
                  icon: <PlanFeatureMaterialIcon icon="directions_car" />,
              }
            : planName === 'Basic' || planName === 'Starter'
            ? {
                  label: (
                      <>
                          <b>Self</b> onboarding
                      </>
                  ),
                  icon: <PlanFeatureMaterialIcon icon="directions_walk" />,
              }
            : {
                  label: (
                      <>
                          <b>Lite</b> onboarding
                      </>
                  ),
                  icon: <PlanFeatureMaterialIcon icon="directions_bike" />,
              },
        {
            label: 'Revenue statistics',
            icon: <PlanFeatureMaterialIcon icon="attach_money" />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.RevenueStatistics
            ),
        },
        {
            label: 'Magento integration',
            icon: <PlanFeatureVectorIcon url={magentoIcon} />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.MagentoIntegration
            ),
        },
        {
            label: 'Dedicated success manager',
            icon: <PlanFeatureMaterialIcon icon="person_pin" />,
            isDisabled: !(
                planId?.includes('advanced') ||
                planId?.includes('enterprise') ||
                isCustom
            ),
        },
        {
            label: 'Custom services',
            icon: <PlanFeatureMaterialIcon icon="blur_on" />,
            isDisabled: !(planId?.includes('enterprise') || isCustom),
        },
    ]
}

export const getEnterprisePlanCardFeatures = (): PlanCardFeature[] => {
    const enterpriseFeatures: PlanCardFeature[] = [
        {
            icon: <PlanFeatureMaterialIcon icon="playlist_add_check" />,
            label: (
                <>
                    Discounted prices for <b>10k+ tickets</b>
                </>
            ),
        },
    ]
    return enterpriseFeatures.concat(
        getCommonPlanCardFeatures({
            planId: 'enterprise',
            planName: 'Enterprise',
            enabledFeatures: Object.values(AccountFeature),
            enableHardCodedFeatures: true,
        })
    )
}

type GetPlanCardFeaturesForPlanArgs = {
    plan: PlanWithCurrencySign
    enableHardCodedFeatures: boolean
}

export const getPlanCardFeaturesForPlan = ({
    plan,
    enableHardCodedFeatures,
}: GetPlanCardFeaturesForPlanArgs): PlanCardFeature[] => {
    if (plan.id === 'enterprise') {
        return getEnterprisePlanCardFeatures()
    }
    const planFeatures = plan.features
    const enabledFeatures = _pickBy(planFeatures, (featureMetadata) =>
        isFeatureEnabled(featureMetadata)
    ) as AccountFeatures
    const enabledFeaturesNames = Object.keys(
        enabledFeatures
    ) as AccountFeature[]
    return (
        [
            {
                icon: <PlanFeatureMaterialIcon icon="playlist_add_check" />,
                label: (
                    <BillableTicketsLabel
                        costPerTicket={plan.cost_per_ticket}
                        currency={plan.currency}
                        freeTickets={plan.free_tickets}
                    />
                ),
            },
        ] as PlanCardFeature[]
    ).concat(
        getCommonPlanCardFeatures({
            planId: plan.id,
            planName: plan.name,
            enableHardCodedFeatures,
            enabledFeatures: enabledFeaturesNames,
            phoneNumbersLimit:
                planFeatures && planFeatures[AccountFeature.PhoneNumber]?.limit,
            isCustom: plan.custom,
        })
    )
}

export const getPlanCardFeaturesForPrices = (
    prices: (HelpdeskPrice | AutomationPrice)[],
    enableHardCodedFeatures = false
): PlanCardFeature[] => {
    const helpdeskPrice = prices.find((price) => isHelpdeskPrice(price)) as
        | HelpdeskPrice
        | undefined
    if (!helpdeskPrice) {
        return []
    }
    if (helpdeskPrice.name.toLocaleLowerCase() === 'enterprise') {
        return getEnterprisePlanCardFeatures()
    }
    const planFeatures = prices.reduce(
        (
            acc: Partial<HelpdeskPriceFeatures & AutomationPriceFeatures>,
            price
        ) => {
            return {...acc, ...price.features}
        },
        {}
    )
    const enabledFeatures = _pickBy(planFeatures, (featureMetadata) =>
        isFeatureEnabled(featureMetadata)
    ) as AccountFeatures
    const enabledFeaturesNames = Object.keys(
        enabledFeatures
    ) as AccountFeature[]
    return (
        [
            {
                icon: <PlanFeatureMaterialIcon icon="playlist_add_check" />,
                label: (
                    <BillableTicketsLabel
                        costPerTicket={helpdeskPrice.cost_per_ticket}
                        currency={helpdeskPrice.currency}
                        freeTickets={helpdeskPrice.free_tickets}
                    />
                ),
            },
        ] as PlanCardFeature[]
    ).concat(
        getCommonPlanCardFeatures({
            planId: helpdeskPrice.name.toLocaleLowerCase(),
            planName: helpdeskPrice.name,
            enableHardCodedFeatures,
            enabledFeatures: enabledFeaturesNames,
            phoneNumbersLimit:
                planFeatures && planFeatures[AccountFeature.PhoneNumber]?.limit,
            isCustom: helpdeskPrice.custom,
        })
    )
}
