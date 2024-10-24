import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'

import {getCurrentAccountCreatedDatetime} from 'state/currentAccount/selectors'

const useIsQuickRepliesEnabled = () => {
    const quickRepliesSunsetTime =
        useFlags()[FeatureFlagKey.ChatQuickRepliesSunset]

    const quickRepliesSunsetDate = quickRepliesSunsetTime
        ? new Date(Number(quickRepliesSunsetTime))
        : null

    const currentAccountCreatedDate = new Date(
        useAppSelector(getCurrentAccountCreatedDatetime)
    )

    return (
        quickRepliesSunsetDate === null ||
        currentAccountCreatedDate < quickRepliesSunsetDate
    )
}

export default useIsQuickRepliesEnabled
