import React from 'react'
import {useParams} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Loader from 'pages/common/components/Loader/Loader'
import {FeatureFlagKey} from '../../../config/featureFlags'
import {useAiAgentStoreConfigurationContext} from './providers/AiAgentStoreConfigurationContext'
import {AiAgentConfigurationView} from './AiAgentConfigurationView/AiAgentConfigurationView'
import {useWelcomePageAcknowledged} from './hooks/useWelcomePageAcknowledged'
import {AIAgentWelcomePageView} from './components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import {AIAgentWelcomePageDynamic} from './AIAgentWelcomePageDynamic'

type WelcomePageFeatureFlag =
    | undefined
    | 'off'
    | 'dynamic_odd_static_even'
    | 'static_odd_dynamic_even'

const AiAgentViewContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')

    const welcomePageFeatureFlag: WelcomePageFeatureFlag =
        useFlags()[FeatureFlagKey.AIAgentWelcomePage]

    const welcomePageAcknowledged = useWelcomePageAcknowledged({shopName})

    const storeConfiguration = useAiAgentStoreConfigurationContext()

    if (storeConfiguration.isLoading || welcomePageAcknowledged.isLoading) {
        return <Loader data-testid="loader" />
    }

    if (
        (welcomePageFeatureFlag === 'dynamic_odd_static_even' ||
            welcomePageFeatureFlag === 'static_odd_dynamic_even') &&
        storeConfiguration.storeConfiguration === undefined &&
        welcomePageAcknowledged.data?.acknowledged !== true
    ) {
        const showDynamic =
            (welcomePageFeatureFlag === 'dynamic_odd_static_even' &&
                accountId % 2 !== 0) ||
            (welcomePageFeatureFlag === 'static_odd_dynamic_even' &&
                accountId % 2 === 0)

        return showDynamic ? (
            <AIAgentWelcomePageDynamic shopName={shopName} />
        ) : (
            <AIAgentWelcomePageView state="static" shopName={shopName} />
        )
    }

    return (
        <AiAgentConfigurationView
            accountDomain={accountDomain}
            shopName={shopName}
        />
    )
}

export default AiAgentViewContainer
