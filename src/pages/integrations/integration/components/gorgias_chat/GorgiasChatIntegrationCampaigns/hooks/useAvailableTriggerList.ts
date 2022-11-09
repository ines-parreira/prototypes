import {useMemo} from 'react'

import {TRIGGER_LIST} from '../constants/triggers'

type FnArguments = {
    isRevenueBetaTester?: boolean
    isShopifyStore?: boolean
}

export function useAvailableTriggerList({
    isRevenueBetaTester = false,
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
                    return isRevenueBetaTester === value
                }

                return false
            })
        })
    }, [isRevenueBetaTester, isShopifyStore])

    return options
}
