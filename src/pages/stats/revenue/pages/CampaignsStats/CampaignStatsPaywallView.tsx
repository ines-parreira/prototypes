import React from 'react'

import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import ConvertPaywallView from 'pages/convert/common/components/ConvertPaywallView'
import {assetsUrl} from 'utils'

const TITLE = 'Campaigns'

const CampaignStatsPaywallView = () => {
    return (
        <ConvertPaywallView
            pageHeader={TITLE}
            header={'Track chat campaigns'}
            description={
                'Provide the info and incentives customers need to place an order, provide special upsell offers during checkout, and more!'
            }
            previewImage={assetsUrl(
                '/img/paywalls/screens/convert_campaigns_statistics.png'
            )}
            modalCanduId={'campaign-stats-paywall-modal'}
            onSubscribedRedirectPath={'/app/stats/convert/campaigns'}
        />
    )
}

export default withCanduPaywall({
    title: TITLE,
    canduId: 'campaign-stats-paywall',
})(CampaignStatsPaywallView)
