import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import {useGetStoreConfigurationPure} from '../../../models/aiAgent/queries'
import {EditAiAgentSettingsForm} from './EditAiAgentSettingsForm'
import {CreateAiAgentSettingsForm} from './CreateAiAgentSettingsForm'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'

type AiAgentStoreViewProps = {
    shopName: string
    accountDomain: string
}

export const AiAgentStoreView = ({
    shopName,
    accountDomain,
}: AiAgentStoreViewProps) => {
    const {headerNavbarItems} = useAiAgentNavigation({shopName})

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
