import React from 'react'
import {Link} from 'react-router-dom'

import RestrictedFeature from '../common/components/RestrictedFeature'

const RevenueStatsRestrictedFeature = () => {
    const assetsURL = window.GORGIAS_ASSETS_URL || ''
    const imagesURL = [
        `${assetsURL}/static/private/img/presentationals/revenue-presentation.png`,
    ]
    const alertMsg = (
        <>
            Your e-commerce store needs to be connected to Gorgias to use this
            feature.
            <Link to="/app/settings/integrations/shopify/new">
                {' '}
                Add one here
            </Link>
        </>
    )

    return (
        <RestrictedFeature
            alertMsg={alertMsg}
            imagesURL={imagesURL}
            info="Assess how much sales your support team is influencing. Staff and reward your support team
        according to sales. Track and increase conversion, using Chat campaigns, for example."
        />
    )
}

export default RevenueStatsRestrictedFeature
