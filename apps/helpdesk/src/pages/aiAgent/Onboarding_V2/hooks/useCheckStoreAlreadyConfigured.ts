import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'
import { getCurrentDomain } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useCheckStoreAlreadyConfigured = (): null => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const dispatch = useAppDispatch()
    const accountDomain = useAppSelector(getCurrentDomain)

    const { data: storeConfig, isLoading: isFetchingStoreConfiguration } =
        useFetchAiAgentStoreConfigurationData({
            accountDomain,
            storeName: shopName,
            enabled: true,
        })
    const history = useHistory()

    // Return early if still loading
    if (isFetchingStoreConfiguration) {
        return null
    }

    if (shopName && storeConfig) {
        dispatch(
            notify({
                status: NotificationStatus.Error,
                message:
                    'An Existing Store configuration is already set up. Redirecting to the AI agent settings.',
                id: 'store-already-configured-error',
            }),
        )
        history.push(`/app/ai-agent/${shopType}/${shopName}/settings`)
    }

    return null
}
