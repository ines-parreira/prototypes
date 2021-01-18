import React from 'react'
import {Link} from 'react-router-dom'

import RestrictedFeature from '../../common/components/RestrictedFeature'

const assetsURL = window.GORGIAS_ASSETS_URL || ''
const imagesURL = [
    `${assetsURL}/static/private/img/presentationals/satisfaction-survey-stats.png`,
    `${assetsURL}/static/private/img/presentationals/satisfaction-survey-ticket-details.png`,
]

const RestrictedSatisfactionSurvey = () => (
    <RestrictedFeature
        alertMsg={
            <>
                This feature is only available for Pro and above plans.
                <Link to="/app/settings/billing/plans"> Upgrade here.</Link>
            </>
        }
        imagesURL={imagesURL}
        info="Keep track of the performance of your support team by sending a satisfaction survey after a
                 ticket is closed."
    />
)
export default RestrictedSatisfactionSurvey
