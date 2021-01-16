import React, {Component} from 'react'
import {Link} from 'react-router'

import RestrictedFeature from '../../common/components/RestrictedFeature'

type Props = {
    hasFeature: boolean,
    hasRequiredIntegration: boolean,
}

export default class RestrictedRevenue extends Component<Props> {
    render() {
        const {hasFeature, hasRequiredIntegration} = this.props
        const assetsURL = window.GORGIAS_ASSETS_URL || ''
        const imagesURL = [
            `${assetsURL}/static/private/img/presentationals/revenue-presentation.png`,
        ]
        let alertMsg

        if (!hasRequiredIntegration) {
            alertMsg = (
                <>
                    Your e-commerce store needs to be connected to Gorgias to
                    use this feature.
                    <Link to="/app/settings/integrations/shopify/new">
                        {' '}
                        Add one here
                    </Link>
                </>
            )
        } else if (!hasFeature) {
            alertMsg = (
                <>
                    This feature is only available for Pro and above plans.
                    <Link to="/app/settings/billing/plans"> Upgrade here.</Link>
                </>
            )
        }

        return (
            <RestrictedFeature
                alertMsg={alertMsg}
                imagesURL={imagesURL}
                info="Assess how much sales your support team is influencing. Staff and reward your support team
                according to sales. Track and increase conversion, using Chat campaigns, for example."
            />
        )
    }
}
