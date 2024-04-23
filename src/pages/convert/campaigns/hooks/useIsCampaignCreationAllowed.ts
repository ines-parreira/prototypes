import {useMemo} from 'react'
import {Map} from 'immutable'
import {useAreConvertLightCampaignsEnabled} from 'pages/convert/common/hooks/useAreConvertLightCampaignsEnabled'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'

export const useIsCampaignCreationAllowed = (integration: Map<any, any>) => {
    const areConvertLightCampaignsEnabled = useAreConvertLightCampaignsEnabled()
    const isConvertSubscriber = useIsConvertSubscriber()
    const chatHasShopifyStore = chatIsShopifyStore(integration)

    return useMemo(() => {
        return (
            !areConvertLightCampaignsEnabled ||
            isConvertSubscriber ||
            !chatHasShopifyStore
        )
    }, [
        areConvertLightCampaignsEnabled,
        isConvertSubscriber,
        chatHasShopifyStore,
    ])
}
