import { useCallback, useMemo } from 'react'

import { IntegrationType } from 'models/integration/constants'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import { DEFAULT_UNFULFILLED_MESSAGE } from '../constants'

export default function useTrackOrderFlow(shopName: string) {
    const {
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const handleTrackOrderFlowUpdate = useCallback(
        (trackOrderFlow: SelfServiceConfiguration['trackOrderPolicy']) => {
            void handleSelfServiceConfigurationUpdate((draft) => {
                draft.trackOrderPolicy.unfulfilledMessage =
                    trackOrderFlow.unfulfilledMessage
            })
        },
        [handleSelfServiceConfigurationUpdate],
    )

    const trackOrderFlow = useMemo(
        () =>
            selfServiceConfiguration?.trackOrderPolicy && {
                ...selfServiceConfiguration.trackOrderPolicy,
                unfulfilledMessage:
                    selfServiceConfiguration.trackOrderPolicy
                        .unfulfilledMessage ?? DEFAULT_UNFULFILLED_MESSAGE,
            },
        [selfServiceConfiguration?.trackOrderPolicy],
    )

    return {
        isUpdatePending,
        storeIntegration,
        trackOrderFlow,
        selfServiceConfiguration,
        handleTrackOrderFlowUpdate,
    }
}
