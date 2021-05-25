import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {STORE_INTEGRATION_TYPES} from '../../config/stats'
import {getIntegrations} from '../../state/integrations/selectors'
import {AccountFeature} from '../../state/currentAccount/types'
import {RootState} from '../../state/types'
import withPaywall from '../common/utils/withPaywall'
import RestrictedFeature from '../common/components/RestrictedFeature'

import StatsComponent from './StatsComponent'

type Props = ConnectedProps<typeof connector>

export function RevenueStatsContainer({storeIntegrations}: Props) {
    if (storeIntegrations == null || storeIntegrations.size === 0) {
        const assetsURL = window.GORGIAS_ASSETS_URL || ''
        const imagesURL = [
            `${assetsURL}/static/private/img/presentationals/revenue-presentation.png`,
        ]
        const alertMsg = (
            <>
                Your e-commerce store needs to be connected to Gorgias to use
                this feature.
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

    return <StatsComponent />
}

const connector = connect((state: RootState) => ({
    storeIntegrations: getIntegrations(state).filter(
        (integration: Map<any, any>) => {
            return STORE_INTEGRATION_TYPES.includes(integration.get('type'))
        }
    ),
}))

export default withPaywall(AccountFeature.RevenueStatistics)(
    connector(RevenueStatsContainer)
)
