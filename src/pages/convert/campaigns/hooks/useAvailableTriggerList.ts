import {useMemo} from 'react'

import _pickBy from 'lodash/pickBy'
import {TRIGGERS_CONFIG} from '../constants/triggers'
import {TriggerConfigValue} from '../types/TriggerConfig'

type FnArguments = {
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    isShopifyHeadless?: boolean
}

export function useAvailableTriggerList({
    isConvertSubscriber = false,
    isShopifyStore = false,
    isShopifyHeadless = false,
}: FnArguments) {
    return useMemo(() => {
        const filterFn = (trigger: TriggerConfigValue) => {
            const requirements = Object.entries(trigger.requirements)

            if (requirements.length === 0) {
                return true
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
    }, [isShopifyStore, isConvertSubscriber, isShopifyHeadless])
}
