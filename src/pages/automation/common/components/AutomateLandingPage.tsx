import React from 'react'

import {Redirect} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'

import {compare} from 'utils'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from '../hooks/useStoreIntegrations'
import {AutomateFeatures} from '../types'
import AutomatePaywallView from './AutomatePaywallView'
import StoreIntegrationView from './StoreIntegrationView'

const AutomateLandingPage = () => {
    const hasAutomateFeature = useAppSelector(getHasAutomationAddOn)
    const hasLegacyAutomateFeatures = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const storeIntegrations = useStoreIntegrations()
    if (hasAutomateFeature || hasLegacyAutomateFeatures) {
        if (!storeIntegrations.length) {
            return <StoreIntegrationView title={AutomateFeatures.Automate} />
        }
        const sortedStoreIntegrations = [...storeIntegrations].sort((a, b) =>
            compare(a.name, b.name)
        )
        const shopType = sortedStoreIntegrations[0].type
        const shopName = getShopNameFromStoreIntegration(
            sortedStoreIntegrations[0]
        )
        return <Redirect to={`/app/automation/${shopType}/${shopName}/flows`} />
    }

    return <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
}
export default AutomateLandingPage
