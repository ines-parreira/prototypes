import _pickBy from 'lodash/pickBy'
import {useMemo} from 'react'

import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {useAreConvertLLMProductRecommendationsEnabled} from 'pages/convert/common/hooks/useAreConvertLLMProductRecommendationsEnabled'

import {CONVERT_LIGHT_TRIGGERS, TRIGGERS_CONFIG} from '../constants/triggers'
import {TriggerConfigValue} from '../types/TriggerConfig'

type FnArguments = {
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    isShopifyHeadless?: boolean
    isLightCampaign?: boolean
}

export function useAvailableTriggerList({
    isConvertSubscriber = false,
    isShopifyStore = false,
    isShopifyHeadless = false,
    isLightCampaign = false,
}: FnArguments) {
    const areLLMProductRecommendationsEnabled =
        useAreConvertLLMProductRecommendationsEnabled()
    return useMemo(() => {
        const filterFn = (trigger: TriggerConfigValue, triggerType: string) => {
            if (
                triggerType === CampaignTriggerType.OutOfStockProductPages &&
                !areLLMProductRecommendationsEnabled
            ) {
                // temporary code until we release the feature
                return false
            }

            const requirements = Object.entries(trigger.requirements)

            if (requirements.length === 0) {
                return true
            }

            if (
                isLightCampaign &&
                !CONVERT_LIGHT_TRIGGERS.includes(
                    triggerType as CampaignTriggerType
                )
            ) {
                return false
            }

            return requirements.every(([req, value]) => {
                if (req === 'hidden') {
                    return false
                }

                if (req === 'shopify') {
                    return isShopifyStore === value
                }

                if (req === 'revenue') {
                    return isConvertSubscriber === value
                }

                if (req === 'headless') {
                    return isShopifyHeadless === value
                }

                return false
            })
        }

        return _pickBy(TRIGGERS_CONFIG, filterFn)
    }, [
        areLLMProductRecommendationsEnabled,
        isLightCampaign,
        isShopifyStore,
        isConvertSubscriber,
        isShopifyHeadless,
    ])
}
