import { useMemo } from 'react'

import type { Map } from 'immutable'
import _isEmpty from 'lodash/isEmpty'

import { useGetSelfServiceConfiguration } from 'models/selfServiceConfiguration/queries'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { toJS } from 'utils'

// TO DO: Merge with src/pages/integrations/integration/components/gorgias_chat/GorgiasChatCreationWizard/components/steps/hooks/useSelfServiceConfiguration.ts

type SelfServiceConfigurationResult = {
    selfServiceConfigurationEnabled: boolean
    selfServiceConfiguration: SelfServiceConfiguration | null
}

const useSelfServiceConfiguration = (
    integration: Map<any, any>,
): SelfServiceConfigurationResult => {
    const shopType = integration.get('type')
    const shopName =
        integration !== undefined
            ? getShopNameFromStoreIntegration(toJS(integration))
            : undefined
    const { data: selfServiceConfiguration } = useGetSelfServiceConfiguration(
        shopType,
        shopName,
    )

    const selfServiceConfigurationEnabled = useMemo(() => {
        if (_isEmpty(selfServiceConfiguration)) return false

        const canTrackOrders =
            selfServiceConfiguration?.trackOrderPolicy.enabled
        const canManageOrders =
            canTrackOrders ||
            selfServiceConfiguration?.reportIssuePolicy.enabled ||
            selfServiceConfiguration?.cancelOrderPolicy.enabled ||
            selfServiceConfiguration?.returnOrderPolicy.enabled

        if (!canManageOrders && !canTrackOrders) {
            return false
        }
        return true
    }, [selfServiceConfiguration])

    return {
        selfServiceConfigurationEnabled,
        selfServiceConfiguration: selfServiceConfiguration ?? null,
    }
}

export default useSelfServiceConfiguration
