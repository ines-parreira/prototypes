import React from 'react'
import {assetsUrl} from 'utils'

import RestrictedFeature from '../common/components/RestrictedFeature'

const RevenueStatsRestrictedFeature = () => {
    const imagesURL = [
        assetsUrl('/img/presentationals/revenue-presentation.png'),
    ]

    return (
        <RestrictedFeature
            actionHref="/app/settings/integrations/shopify/new"
            actionLabel="Add one here"
            alertMsg="Your e-commerce store needs to be connected to Gorgias to use this feature."
            imagesURL={imagesURL}
            info="Assess how much sales your support team is influencing. Staff and reward your support team
        according to sales. Track and increase conversion, using Chat campaigns, for example."
        />
    )
}

export default RevenueStatsRestrictedFeature
