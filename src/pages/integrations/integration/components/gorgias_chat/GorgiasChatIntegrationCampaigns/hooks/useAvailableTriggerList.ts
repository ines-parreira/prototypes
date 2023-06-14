import {useMemo} from 'react'

import {TRIGGER_LIST} from '../constants/triggers'

type FnArguments = {
    isRevenueBetaTester?: boolean
    isShopifyStore?: boolean
    isShopifyHeadless?: boolean
    // TODO: Remove this in https://linear.app/gorgias/issue/REV-930/[helpdesk-and-chat]-remove-the-ld-flag
    areShopifyHistoryTriggersEnabled?: boolean
}

export function useAvailableTriggerList({
    isRevenueBetaTester = false,
    isShopifyStore = false,
    isShopifyHeadless = false,
    areShopifyHistoryTriggersEnabled = false,
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
                    return isRevenueBetaTester === value
                }

                if (req === 'headless') {
                    return isShopifyHeadless === value
                }

                // TODO: Remove this in https://linear.app/gorgias/issue/REV-930/[helpdesk-and-chat]-remove-the-ld-flag
                if (req === 'shopify_history') {
                    return areShopifyHistoryTriggersEnabled === value
                }

                return false
            })
        })
    }, [
        isShopifyStore,
        isRevenueBetaTester,
        isShopifyHeadless,
        areShopifyHistoryTriggersEnabled,
    ])

    return options
}
