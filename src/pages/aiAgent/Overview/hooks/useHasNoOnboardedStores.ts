import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { getCurrentDomain } from 'state/currentAccount/selectors'

export const useHasNoOnboardedStores = () => {
    const accountDomain = useAppSelector(getCurrentDomain)

    const { storeConfigurations, isLoading } = useStoreConfigurationForAccount({
        accountDomain,
    })

    return useMemo(
        () =>
            (!storeConfigurations || storeConfigurations.length === 0) &&
            !isLoading,
        [isLoading, storeConfigurations],
    )
}
