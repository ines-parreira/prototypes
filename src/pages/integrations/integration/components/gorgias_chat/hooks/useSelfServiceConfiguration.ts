import {useEffect, useMemo, useState} from 'react'
import _isEmpty from 'lodash/isEmpty'
import {Map} from 'immutable'
import {fetchSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

// TO DO: Merge with src/pages/integrations/integration/components/gorgias_chat/GorgiasChatCreationWizard/components/steps/hooks/useSelfServiceConfiguration.ts

type SelfServiceConfigurationResult = {
    selfServiceConfigurationEnabled: boolean
    selfServiceConfiguration: SelfServiceConfiguration
}

const useSelfServiceConfiguration = (
    integration: Map<any, any>
): SelfServiceConfigurationResult => {
    const [selfServiceConfiguration, setSelfServiceConfiguration] = useState(
        {} as SelfServiceConfiguration
    )
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])

    useEffect(() => {
        if (!shopIntegrationId) return
        const fetchSSConfiguration = async () => {
            const selfServiceConfiguration: SelfServiceConfiguration =
                await fetchSelfServiceConfiguration(shopIntegrationId)
            setSelfServiceConfiguration(selfServiceConfiguration)
        }

        void fetchSSConfiguration()
    }, [shopIntegrationId])

    const selfServiceConfigurationEnabled = useMemo(() => {
        if (_isEmpty(selfServiceConfiguration)) return false
        const quickResponses =
            selfServiceConfiguration?.quick_response_policies.filter(
                (quickResponse) => !quickResponse.deactivated_datetime
            ) ?? []
        const canTrackOrders =
            selfServiceConfiguration?.track_order_policy.enabled
        const canManageOrders =
            canTrackOrders ||
            selfServiceConfiguration?.report_issue_policy.enabled ||
            selfServiceConfiguration?.cancel_order_policy.enabled ||
            selfServiceConfiguration?.return_order_policy.enabled

        if (!quickResponses.length && !canManageOrders && !canTrackOrders) {
            return false
        }
        return true
    }, [selfServiceConfiguration])

    return {
        selfServiceConfigurationEnabled,
        selfServiceConfiguration,
    }
}

export default useSelfServiceConfiguration
