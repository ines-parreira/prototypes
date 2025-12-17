import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountCreatedDatetime } from 'state/currentAccount/selectors'

const useIsQuickRepliesEnabled = () => {
    const quickRepliesSunsetTime = useFlag(
        FeatureFlagKey.ChatQuickRepliesSunset,
    )

    const quickRepliesSunsetDate = quickRepliesSunsetTime
        ? new Date(Number(quickRepliesSunsetTime))
        : null

    const currentAccountCreatedDate = new Date(
        useAppSelector(getCurrentAccountCreatedDatetime),
    )

    return (
        quickRepliesSunsetDate === null ||
        currentAccountCreatedDate < quickRepliesSunsetDate
    )
}

export default useIsQuickRepliesEnabled
