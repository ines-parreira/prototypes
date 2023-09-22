import {useMemo} from 'react'

import {TRIGGER_LIST} from '../constants/triggers'

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
    const options = useMemo(() => {
        return TRIGGER_LIST.filter((trigger) => {
            const requirements = Object.entries(trigger.requirements)

            if (requirements.length === 0) {
                return true
            }

            return requirements.every(([req, value]) => {
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
        })
    }, [isShopifyStore, isConvertSubscriber, isShopifyHeadless])

    return options
}
