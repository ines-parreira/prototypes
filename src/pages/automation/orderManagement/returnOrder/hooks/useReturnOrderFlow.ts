import {useCallback, useMemo} from 'react'

import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {DEFAULT_RETURN_ACTION} from '../constants'

const useReturnOrderFlow = (shopName: string) => {
    const {
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)

    const handleReturnOrderFlowUpdate = useCallback(
        (returnOrderFlow: SelfServiceConfiguration['return_order_policy']) => {
            if (!selfServiceConfiguration) {
                return
            }

            void handleSelfServiceConfigurationUpdate({
                ...selfServiceConfiguration,
                return_order_policy: returnOrderFlow,
            })
        },
        [selfServiceConfiguration, handleSelfServiceConfigurationUpdate]
    )

    const returnOrderFlow = useMemo(
        () =>
            selfServiceConfiguration?.return_order_policy && {
                ...selfServiceConfiguration.return_order_policy,
                action:
                    selfServiceConfiguration.return_order_policy.action ??
                    DEFAULT_RETURN_ACTION,
            },
        [selfServiceConfiguration?.return_order_policy]
    )

    return {
        isUpdatePending,
        storeIntegration,
        returnOrderFlow,
        selfServiceConfiguration,
        handleReturnOrderFlowUpdate,
    }
}

export default useReturnOrderFlow
