import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Loader from 'pages/common/components/Loader/Loader'
import {FeatureFlagKey} from 'config/featureFlags'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import {useGetStoreConfigurationPure} from '../../../models/aiAgent/queries'
import {EditAiAgentSettingsForm} from './EditAiAgentSettingsForm'
import {CreateAiAgentSettingsForm} from './CreateAiAgentSettingsForm'

type AiAgentStoreViewProps = {
    shopName: string
    accountDomain: string
}

export const AiAgentStoreView = ({
    shopName,
    accountDomain,
}: AiAgentStoreViewProps) => {
    const showAiAgentPlayground: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentPlayground]

    const headerNavbarItems = [
        {
            route: `/app/automation/shopify/${shopName}/ai-agent`,
            title: 'Settings',
        },
    ]

    if (showAiAgentPlayground) {
        headerNavbarItems.push({
            route: `/app/automation/shopify/${shopName}/ai-agent/playground`,
            title: 'Playground',
        })
    }

    const {
        isLoading: getStoreConfigurationIsLoading,
        data: getStoreConfigurationResponse,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    if (getStoreConfigurationIsLoading) {
        return <Loader />
    }

    const serverStoreConfig =
        getStoreConfigurationResponse?.data.storeConfiguration

    if (serverStoreConfig) {
        return (
            <AutomateView
                title={AI_AGENT}
                headerNavbarItems={headerNavbarItems}
            >
                <EditAiAgentSettingsForm
                    shopName={shopName}
                    accountDomain={accountDomain}
                    storeConfiguration={serverStoreConfig}
                />
            </AutomateView>
        )
    }

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <CreateAiAgentSettingsForm
                shopName={shopName}
                accountDomain={accountDomain}
            />
        </AutomateView>
    )
}
