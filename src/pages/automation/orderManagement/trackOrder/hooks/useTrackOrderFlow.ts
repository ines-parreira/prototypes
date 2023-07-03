import {useCallback, useMemo} from 'react'

import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {DEFAULT_UNFULFILLED_MESSAGE} from '../constants'

export default function useTrackOrderFlow(shopName: string) {
    const {
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const handleTrackOrderFlowUpdate = useCallback(
        (trackOrderFlow: SelfServiceConfiguration['track_order_policy']) => {
            void handleSelfServiceConfigurationUpdate((draft) => {
                draft.track_order_policy.unfulfilled_message =
                    trackOrderFlow.unfulfilled_message
            })
        },
        [handleSelfServiceConfigurationUpdate]
    )

    const trackOrderFlow = useMemo(
        () =>
            selfServiceConfiguration?.track_order_policy && {
                ...selfServiceConfiguration.track_order_policy,
                unfulfilled_message:
                    selfServiceConfiguration.track_order_policy
                        .unfulfilled_message ?? DEFAULT_UNFULFILLED_MESSAGE,
            },
        [selfServiceConfiguration?.track_order_policy]
    )

    return {
        isUpdatePending,
        storeIntegration,
        trackOrderFlow,
        selfServiceConfiguration,
        handleTrackOrderFlowUpdate,
    }
}
