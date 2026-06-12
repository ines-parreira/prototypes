import { useMemo } from 'react'

import _pickBy from 'lodash/pickBy'

import type { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

import { CONVERT_LIGHT_TRIGGERS, TRIGGERS_CONFIG } from '../constants/triggers'
import type { TriggerConfigValue } from '../types/TriggerConfig'

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
    return useMemo(() => {
        const filterFn = (trigger: TriggerConfigValue, triggerType: string) => {
            const requirements = Object.entries(trigger.requirements)

            if (requirements.length === 0) {
                return true
            }

            if (
                isLightCampaign &&
                !CONVERT_LIGHT_TRIGGERS.includes(
                    triggerType as CampaignTriggerType,
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
        isLightCampaign,
        isShopifyStore,
        isConvertSubscriber,
        isShopifyHeadless,
    ])
}
