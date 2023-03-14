import {useCallback, useMemo} from 'react'

import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {
    AUTOMATED_RESPONSE,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'

import {DEFAULT_RESPONSE_MESSAGE_CONTENT} from '../constants'

const useCancelOrderFlow = (shopName: string) => {
    const {
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const handleCancelOrderFlowUpdate = useCallback(
        (cancelOrderFlow: SelfServiceConfiguration['cancel_order_policy']) => {
            if (!selfServiceConfiguration) {
                return
            }

            void handleSelfServiceConfigurationUpdate({
                ...selfServiceConfiguration,
                cancel_order_policy: cancelOrderFlow,
            })
        },
        [selfServiceConfiguration, handleSelfServiceConfigurationUpdate]
    )

    const cancelOrderFlow = useMemo(
        () =>
            selfServiceConfiguration?.cancel_order_policy && {
                ...selfServiceConfiguration.cancel_order_policy,
                action: selfServiceConfiguration.cancel_order_policy.action ?? {
                    type: AUTOMATED_RESPONSE,
                    response_message_content: DEFAULT_RESPONSE_MESSAGE_CONTENT,
                },
            },
        [selfServiceConfiguration?.cancel_order_policy]
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
