import { useMemo } from 'react'

import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import {
    AI_AGENT_ADVANTAGES,
    AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD,
    SHOPPING_ASSISTANT_ADVANTAGES,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
    TYPICAL_RESULTS_TEXT,
} from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialManageModalProps } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import {
    getTrialEndingModalDescription,
    getTrialEndingModalSecondaryDescription,
} from 'pages/aiAgent/trial/hooks/useTrialEndingModal/getTrialEndingModalDescription'
import { TrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { toPercentage } from 'pages/aiAgent/trial/utils/utils'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export type UseTrialEndingModalProps = {
    trialType: TrialType
    trialMetrics: TrialMetrics
    trialAccess: TrialAccess
    storeName?: string
}

export type UseTrialEndingModalReturn = Pick<
    TrialManageModalProps,
    'title' | 'description' | 'advantages' | 'secondaryDescription'
>

export const useTrialEndingModal = ({
    trialType,
    trialMetrics,
    trialAccess,
    storeName,
}: UseTrialEndingModalProps): UseTrialEndingModalReturn => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { data: upgradePlanData } = useAiAgentUpgradePlan(accountDomain)
    const { gmvInfluenced, gmvInfluencedRate, automationRate } = trialMetrics
    const automationRateValue = automationRate?.value ?? 0
    const { isAdminUser } = trialAccess

    const earlyAccessPlanPrice = (upgradePlanData?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount
    const hasSignificantGmvImpact =
        gmvInfluencedRate > SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
    const hasSignificantAutomationRateImpact =
        automationRateValue > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD
    const hasPriceIncrease = difference > 0
    const increaseAmount = formatAmount(difference, currency)
    const cadence = upgradePlanData?.cadence ?? Cadence.Month

    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    const isMultiStore = allShopifyIntegrations.length > 1

    const { optedOutDatetime } = useTrialEnding(storeName ?? '', trialType)

    const title = isAiAgentTrial
        ? 'AI Agent trial ends tomorrow'
        : 'Shopping Assistant trial ends tomorrow'

    const description = useMemo(() => {
        return getTrialEndingModalDescription({
            automationRate: automationRateValue,
            gmvInfluencedRate,
            gmvInfluenced,
            isAiAgentTrial,
            isMultiStore,
            hasSignificantAutomationRateImpact,
            hasSignificantGmvImpact,
            hasCurrentStoreOptedOut: !!optedOutDatetime,
        })
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        automationRateValue,
        gmvInfluenced,
        gmvInfluencedRate,
        hasSignificantGmvImpact,
        isMultiStore,
        optedOutDatetime,
    ])

    const advantages = useMemo(() => {
        if (isAiAgentTrial) {
            return hasSignificantAutomationRateImpact
                ? [`${toPercentage(automationRateValue)} automation rate`]
                : [...AI_AGENT_ADVANTAGES]
        }

        return hasSignificantGmvImpact
            ? [`${gmvInfluenced} GMV uplift`]
            : [...SHOPPING_ASSISTANT_ADVANTAGES]
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        automationRateValue,
        hasSignificantGmvImpact,
        gmvInfluenced,
    ])

    const secondaryDescription = useMemo(() => {
        return getTrialEndingModalSecondaryDescription({
            increaseAmount,
            cadence,
            typicalResultsText: TYPICAL_RESULTS_TEXT,
            isAiAgentTrial,
            hasSignificantAutomationRateImpact,
            hasSignificantGmvImpact,
            hasPriceIncrease,
            isAdminUser,
        })
    }, [
        increaseAmount,
        cadence,
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        hasSignificantGmvImpact,
        hasPriceIncrease,
        isAdminUser,
    ])

    return {
        title,
        description,
        secondaryDescription,
        advantages,
    }
}
