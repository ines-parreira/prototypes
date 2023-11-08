import {useCallback, useMemo} from 'react'
import {List} from 'immutable'

import {toImmutable} from 'common/utils'
import {trimHTML} from 'utils/html'
import {convertFromHTML, convertToHTML} from 'utils/editor'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

const useQuickResponses = (shopType: string, shopName: string) => {
    const {
        isFetchPending,
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(shopType, shopName)

    const handleQuickResponsesUpdate = useCallback(
        (
            quickResponses: SelfServiceConfiguration['quick_response_policies']
        ) => {
            const trimmedQuickResponses = quickResponses.map(
                (quickResponse) => {
                    const html = trimHTML(
                        quickResponse.response_message_content.html
                    )

                    return {
                        ...quickResponse,
                        response_message_content: {
                            ...quickResponse.response_message_content,
                            html: html.length
                                ? convertToHTML(convertFromHTML(html))
                                : html,
                            text: quickResponse.response_message_content.text.trim(),
                        },
                    }
                }
            )

            void handleSelfServiceConfigurationUpdate((draft) => {
                draft.quick_response_policies = trimmedQuickResponses
            })
        },
        [handleSelfServiceConfigurationUpdate]
    )
    const handleQuickResponsesDelete = useCallback(
        (
            quickResponses: SelfServiceConfiguration['quick_response_policies']
        ) => {
            void handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.quick_response_policies = quickResponses
                },
                {success: 'Successfully deleted', error: 'Failed to delete'}
            )
        },
        [handleSelfServiceConfigurationUpdate]
    )
    const quickResponses = useMemo(
        () =>
            (selfServiceConfiguration?.quick_response_policies ?? []).map(
                (quickResponse) => ({
                    ...quickResponse,
                    response_message_content: {
                        ...quickResponse.response_message_content,
                        attachments: toImmutable<List<any>>(
                            quickResponse.response_message_content
                                .attachments ?? []
                        ),
                    },
                })
            ),
        [selfServiceConfiguration?.quick_response_policies]
    )

    return {
        isFetchPending,
        isUpdatePending,
        quickResponses,
        storeIntegration,
        selfServiceConfiguration,
        handleQuickResponsesUpdate,
        handleQuickResponsesDelete,
    }
}

export default useQuickResponses
