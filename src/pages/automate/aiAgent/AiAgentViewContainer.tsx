import React from 'react'
import {useParams} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {FeatureFlagKey} from '../../../config/featureFlags'
import AutomatePaywallView from '../common/components/AutomatePaywallView'
import {AutomateFeatures} from '../common/types'
import Loader from '../../common/components/Loader/Loader'
import {AiAgentStoreView} from './AiAgentStoreView'

const AiAgentViewContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const showAiAgentSettings: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentSettings]

    if (showAiAgentSettings === undefined) {
        return <Loader />
    } else if (!showAiAgentSettings) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.AiAgent} />
        )
    }

    return (
        <AiAgentStoreView accountDomain={accountDomain} shopName={shopName} />
    )
}

export default AiAgentViewContainer
