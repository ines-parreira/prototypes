import useAppSelector from 'hooks/useAppSelector'
import {HelpCenterAutomateType} from 'models/helpCenter/types'
import {useShopifyStoreWithChatConnectionsOptions} from 'pages/settings/helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions'
import {getHasAutomate} from 'state/billing/selectors'

const useGetAutomateType = (): HelpCenterAutomateType => {
    const hasAutomate = useAppSelector(getHasAutomate)

    const shopifyShopsOptions = useShopifyStoreWithChatConnectionsOptions({
        option: '',
        icon: '',
        connectedChatsCount: '',
    })

    if (!hasAutomate) return HelpCenterAutomateType.NON_AUTOMATE

    if (!shopifyShopsOptions?.length)
        return HelpCenterAutomateType.AUTOMATE_NO_STORE

    return HelpCenterAutomateType.AUTOMATE
}

export default useGetAutomateType
