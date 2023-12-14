import {useEffect, useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'

import {fetchSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

// TO DO: Merge with src/pages/integrations/integration/components/gorgias_chat/hooks/useSelfServiceConfiguration.ts

const useSelfServiceConfiguration = (shopIntegrationId?: number) => {
    const [selfServiceConfiguration, setSelfServiceConfiguration] =
        useState<SelfServiceConfiguration>()

    const [{loading: isLoadingSelfServiceConfiguration}, fetchSSConfiguration] =
        useAsyncFn(async () => {
            const selfServiceConfiguration: SelfServiceConfiguration =
                await fetchSelfServiceConfiguration(shopIntegrationId!)

            setSelfServiceConfiguration(selfServiceConfiguration)
        }, [shopIntegrationId])

    useEffect(() => {
        if (!shopIntegrationId) {
            setSelfServiceConfiguration(undefined)
            return
        }

        void fetchSSConfiguration()
    }, [shopIntegrationId, fetchSSConfiguration])

    return {
        selfServiceConfiguration,
        isLoadingSelfServiceConfiguration,
    }
}

export default useSelfServiceConfiguration
