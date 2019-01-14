import React from 'react'

import RestrictedFeature from '../../common/components/RestrictedFeature'


const assetsURL = window.GORGIAS_ASSETS_URL || ''
const imagesURL = [
    `${assetsURL}/static/private/img/presentationals/revenue-presentation.png`,
]


const RevenueUpgrade = () => (
    <RestrictedFeature
        imagesURL={imagesURL}
        info="Assess how much sales your support team is influencing. Staff and reward your support team according to
        sales. Track and increase conversion, using Chat campaigns, for example."
    />
)
export default RevenueUpgrade
