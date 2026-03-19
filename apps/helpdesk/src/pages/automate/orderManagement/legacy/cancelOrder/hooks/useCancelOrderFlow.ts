import { useCallback, useMemo } from 'react'

import { IntegrationType } from 'models/integration/constants'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { AUTOMATED_RESPONSE } from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import { DEFAULT_RESPONSE_MESSAGE_CONTENT } from '../constants'

const useCancelOrderFlow = (shopName: string) => {
    const {
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const handleCancelOrderFlowUpdate = useCallback(
        (cancelOrderFlow: SelfServiceConfiguration['cancelOrderPolicy']) => {
            void handleSelfServiceConfigurationUpdate((draft) => {
                draft.cancelOrderPolicy.exceptions = cancelOrderFlow.exceptions
                draft.cancelOrderPolicy.eligibilities =
                    cancelOrderFlow.eligibilities
                draft.cancelOrderPolicy.action = cancelOrderFlow.action
            })
        },
        [handleSelfServiceConfigurationUpdate],
    )

    const cancelOrderFlow = useMemo(
        () =>
            selfServiceConfiguration?.cancelOrderPolicy && {
                ...selfServiceConfiguration.cancelOrderPolicy,
                action: selfServiceConfiguration.cancelOrderPolicy.action ?? {
                    type: AUTOMATED_RESPONSE,
                    responseMessageContent: DEFAULT_RESPONSE_MESSAGE_CONTENT,
                },
            },
        [selfServiceConfiguration?.cancelOrderPolicy],
    )

    return {
        isUpdatePending,
        storeIntegration,
        cancelOrderFlow,
        selfServiceConfiguration,
        handleCancelOrderFlowUpdate,
    }
}

export default useCancelOrderFlow
