import _pickBy from 'lodash/pickBy'
import React from 'react'

import {isFeatureEnabled} from '../../../../utils/account'
import {
    AccountFeature,
    AccountFeatures,
} from '../../../../state/currentAccount/types'
import {PlanWithCurrencySign} from '../../../../state/billing/types'
import magentoIcon from '../../../../../img/integrations/magento2-mono.svg'

import {PlanCardFeature} from './PlanCard'
import BillableTicketsLabel from './BillableTicketsLabel'
import PlanFeatureMaterialIcon from './PlanFeatureMaterialIcon'
import PlanFeatureVectorIcon from './PlanFeatureVectorIcon'

type GetCommonPlanCardFeaturesArgs = {
    planId: string
    planName: string
    enabledFeatures: AccountFeature[]
    phoneNumbersLimit?: number
}

const getCommonPlanCardFeatures = ({
    planId,
    planName,
    enabledFeatures,
    phoneNumbersLimit,
}: GetCommonPlanCardFeaturesArgs): PlanCardFeature[] => {
    return [
        {
            label: 'Social media & chat',
            icon: <PlanFeatureMaterialIcon icon="forum" />,
        },
        {
            label: 'Macros and rules',
            icon: <PlanFeatureMaterialIcon icon="auto_awesome" />,
        },
        planId === 'enterprise' || planName === 'Advanced'
            ? {
                  label: 'Full onboarding',
                  icon: <PlanFeatureMaterialIcon icon="directions_car" />,
              }
            : planName === 'Basic'
            ? {
                  label: 'Self onboarding',
                  icon: <PlanFeatureMaterialIcon icon="directions_walk" />,
              }
            : {
                  label: 'Lite onboarding',
                  icon: <PlanFeatureMaterialIcon icon="directions_bike" />,
              },
        {
            label: 'Magento integration',
            icon: <PlanFeatureVectorIcon url={magentoIcon} />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.MagentoIntegration
            ),
        },
        {
            label: 'User permissions',
            icon: <PlanFeatureMaterialIcon icon="supervised_user_circle" />,
            isDisabled: !enabledFeatures.includes(AccountFeature.UserRoles),
        },
        {
            label: 'Satisfaction surveys',
            icon: <PlanFeatureMaterialIcon icon="insert_emoticon" />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.SatisfactionSurveys
            ),
        },
        {
            label: 'Chat campaigns',
            icon: <PlanFeatureMaterialIcon icon="chat" />,
            isDisabled: !enabledFeatures.includes(AccountFeature.ChatCampaigns),
        },
        {
            label: phoneNumbersLimit ? (
                <>
                    <b>{phoneNumbersLimit}</b> Phone numbers
                </>
            ) : (
                'Phone'
            ),
            icon: <PlanFeatureMaterialIcon icon="phone" />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.PhoneIntegration
            ),
        },
        {
            label: 'Team Management',
            icon: <PlanFeatureMaterialIcon icon="people_outline" />,
            isDisabled: !enabledFeatures.includes(AccountFeature.Teams),
        },
        {
            label: 'View sharing',
            icon: <PlanFeatureMaterialIcon icon="view_carousel" />,
            isDisabled: !enabledFeatures.includes(AccountFeature.ViewSharing),
        },
        {
            label: 'Revenue statistics',
            icon: <PlanFeatureMaterialIcon icon="attach_money" />,
            isDisabled: !enabledFeatures.includes(
                AccountFeature.RevenueStatistics
            ),
        },
        {
            label: 'Dedicated success manager',
            icon: <PlanFeatureMaterialIcon icon="person_pin" />,
            isDisabled: !(
                planId.includes('advanced') || planId.includes('enterprise')
            ),
        },
        {
            label: 'Custom services',
            icon: <PlanFeatureMaterialIcon icon="blur_on" />,
            isDisabled: !planId.includes('enterprise'),
        },
    ]
}

export const getEnterprisePlanCardFeatures = (): PlanCardFeature[] => {
    const enterpriseFeatures: PlanCardFeature[] = [
        {
            icon: <PlanFeatureMaterialIcon icon="playlist_add_check" />,
            label: (
                <>
                    Discounted prices for <b>volumes of 10k+ tickets</b>
                </>
            ),
        },
    ]
    return enterpriseFeatures.concat(
        getCommonPlanCardFeatures({
            planId: 'enterprise',
            planName: 'Enterprise',
            enabledFeatures: Object.values(AccountFeature),
        })
    )
}

export const getPlanCardFeaturesForPlan = (
    plan: PlanWithCurrencySign,
    showPlanLegacyFeatures: boolean
): PlanCardFeature[] => {
    if (plan.id === 'enterprise') {
        return getEnterprisePlanCardFeatures()
    }
    const planFeatures =
        plan[showPlanLegacyFeatures ? 'legacy_features' : 'features']
    const enabledFeatures = _pickBy(planFeatures, (featureMetadata) =>
        isFeatureEnabled(featureMetadata)
    ) as AccountFeatures
    const enabledFeaturesNames = Object.keys(
        enabledFeatures
    ) as AccountFeature[]
    return ([
        {
            icon: <PlanFeatureMaterialIcon icon="playlist_add_check" />,
            label: <BillableTicketsLabel plan={plan} />,
        },
    ] as PlanCardFeature[]).concat(
        getCommonPlanCardFeatures({
            planId: plan.id,
            planName: plan.name,
            enabledFeatures: enabledFeaturesNames,
            phoneNumbersLimit:
                planFeatures &&
                planFeatures[AccountFeature.PhoneIntegration]?.limit,
        })
    )
}
