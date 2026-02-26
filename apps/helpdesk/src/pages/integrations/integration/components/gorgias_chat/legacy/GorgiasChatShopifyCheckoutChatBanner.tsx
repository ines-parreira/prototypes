import type { Map } from 'immutable'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'
import { hideShopifyCheckoutChatBanner } from 'state/integrations/actions'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatShopifyCheckoutBanner = ({ integration }: Props) => {
    const dispatch = useAppDispatch()

    const hideBanner = () => {
        dispatch(hideShopifyCheckoutChatBanner())
    }

    const integrationId = integration.get('id') as number
    if (!integrationId) {
        return null
    }

    return (
        <AlertBanner
            type={AlertBannerTypes.Info}
            onClose={hideBanner}
            message="Chat is available on Shopify Checkout and Thank you pages!"
            CTA={{
                type: 'internal',
                text: 'Add To Checkout',
                to: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integration.get('id') as string}/${Tab.Installation}`,
            }}
        />
    )
}

export default GorgiasChatShopifyCheckoutBanner
