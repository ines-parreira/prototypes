import {useMemo} from 'react'
import {Map} from 'immutable'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'

export const useIsCampaignCreationAllowed = (integration: Map<any, any>) => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const chatHasShopifyStore = chatIsShopifyStore(integration)

    return useMemo(() => {
        return isConvertSubscriber || !chatHasShopifyStore
    }, [isConvertSubscriber, chatHasShopifyStore])
}
