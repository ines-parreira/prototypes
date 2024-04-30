import React from 'react'
import {useParams} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {FeatureFlagKey} from '../../../config/featureFlags'
import AutomatePaywallView from '../common/components/AutomatePaywallView'
import {AutomateFeatures} from '../common/types'
import {AiAgentStoreView} from './AiAgentStoreView'

const AiAgentViewContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const showAiAgentBetaWaitwall: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentBetaWaitwall]

    if (showAiAgentBetaWaitwall !== false) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.AiAgent} />
        )
    }

    return (
        <AiAgentStoreView accountDomain={accountDomain} shopName={shopName} />
    )
}

export default AiAgentViewContainer
