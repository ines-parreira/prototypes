import {useCallback, useMemo} from 'react'

import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
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
        (returnOrderFlow: SelfServiceConfiguration['returnOrderPolicy']) => {
            void handleSelfServiceConfigurationUpdate((draft) => {
                draft.returnOrderPolicy.action = returnOrderFlow.action
                draft.returnOrderPolicy.eligibilities =
                    returnOrderFlow.eligibilities
                draft.returnOrderPolicy.exceptions = returnOrderFlow.exceptions
            })
        },
        [handleSelfServiceConfigurationUpdate]
    )

    const returnOrderFlow = useMemo(
        () =>
            selfServiceConfiguration?.returnOrderPolicy && {
                ...selfServiceConfiguration.returnOrderPolicy,
                action:
                    selfServiceConfiguration.returnOrderPolicy.action ??
                    DEFAULT_RETURN_ACTION,
            },
        [selfServiceConfiguration?.returnOrderPolicy]
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
