import {useCallback} from 'react'

import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

const useQuickResponses = (integrationType: string, integrationId: string) => {
    const {
        isFetchPending,
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(integrationType, integrationId)

    const handleQuickResponsesUpdate = useCallback(
        (
            quickResponses: SelfServiceConfiguration['quick_response_policies']
        ) => {
            if (!selfServiceConfiguration) {
                return
            }

            void handleSelfServiceConfigurationUpdate({
                ...selfServiceConfiguration,
                quick_response_policies: quickResponses,
            })
        },
        [selfServiceConfiguration, handleSelfServiceConfigurationUpdate]
    )
    const handleQuickResponsesDelete = useCallback(
        (
            quickResponses: SelfServiceConfiguration['quick_response_policies']
        ) => {
            if (!selfServiceConfiguration) {
                return
            }

            void handleSelfServiceConfigurationUpdate(
                {
                    ...selfServiceConfiguration,
                    quick_response_policies: quickResponses,
                },
                {success: 'Successfully deleted', error: 'Failed to delete'}
            )
        },
        [selfServiceConfiguration, handleSelfServiceConfigurationUpdate]
    )

    return {
        isFetchPending,
        isUpdatePending,
        quickResponses: selfServiceConfiguration?.quick_response_policies ?? [],
        handleQuickResponsesUpdate,
        handleQuickResponsesDelete,
    }
}

export default useQuickResponses
