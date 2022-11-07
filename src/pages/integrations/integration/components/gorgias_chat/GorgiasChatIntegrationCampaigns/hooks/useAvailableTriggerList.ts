import {useMemo} from 'react'

import {TRIGGER_LIST} from '../constants/triggers'

type FnArguments = {
    isRevenueTester?: boolean
    isShopifyStore?: boolean
}

export function useAvailableTriggerList({
    isRevenueTester = false,
    isShopifyStore = false,
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
                    return isRevenueTester === value
                }

                return false
            })
        })
    }, [isRevenueTester, isShopifyStore])

    return options
}
