import React from 'react'

import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import ConvertPaywallView from 'pages/convert/common/components/ConvertPaywallView'
import {assetsUrl} from 'utils'

const TITLE = 'Campaigns'

const CampaignStatsPaywallView = () => {
    return (
        <ConvertPaywallView
            pageHeader={TITLE}
            header={'Level up your Chat campaign conversions'}
            description={
                'Convert Chat campaigns empower you to engage with shoppers at the perfect moment and allow seamless optimization through our campaign dashboard for effortless progress tracking.'
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
