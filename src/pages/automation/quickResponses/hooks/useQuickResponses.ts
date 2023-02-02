import {useCallback, useMemo} from 'react'

import {trimHTML} from 'utils/html'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

const useQuickResponses = (shopType: string, shopName: string) => {
    const {
        isFetchPending,
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(shopType, shopName)

    const handleQuickResponsesUpdate = useCallback(
        (
            quickResponses: SelfServiceConfiguration['quick_response_policies']
        ) => {
            if (!selfServiceConfiguration) {
                return
            }

            const trimmedQuickResponses = quickResponses.map(
                (quickResponse) => ({
                    ...quickResponse,
                    response_message_content: {
                        ...quickResponse.response_message_content,
                        html: trimHTML(
                            quickResponse.response_message_content.html
                        ),
                        text: quickResponse.response_message_content.text.trim(),
                    },
                })
            )

            void handleSelfServiceConfigurationUpdate({
                ...selfServiceConfiguration,
                quick_response_policies: trimmedQuickResponses,
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
    const quickResponses = useMemo(
        () => selfServiceConfiguration?.quick_response_policies ?? [],
        [selfServiceConfiguration?.quick_response_policies]
    )

    return {
        isFetchPending,
        isUpdatePending,
        quickResponses,
        selfServiceConfiguration,
        handleQuickResponsesUpdate,
        handleQuickResponsesDelete,
    }
}

export default useQuickResponses
