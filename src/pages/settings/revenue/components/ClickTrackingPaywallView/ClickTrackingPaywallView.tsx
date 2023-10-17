import React from 'react'

import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import ConvertPaywallView from 'pages/convert/common/components/ConvertPaywallView'
import {assetsUrl} from 'utils'

const TITLE = 'Click tracking'

const ClickTrackingPaywallView = () => {
    return (
        <ConvertPaywallView
            pageHeader={TITLE}
            header={'Track clicks on chat campaigns'}
            description={
                'Provide the info and incentives customers need to place an order, provide special upsell offers during checkout, and more!'
            }
            previewImage={assetsUrl(
                '/img/paywalls/screens/convert_campaigns_statistics.png'
            )}
            modalCanduId={'click-tracking-paywall-modal'}
            onSubscribedRedirectPath={'/app/settings/convert/click-tracking'}
        />
    )
}

export default withCanduPaywall({
    title: TITLE,
    canduId: 'click-tracking-paywall',
})(ClickTrackingPaywallView)
