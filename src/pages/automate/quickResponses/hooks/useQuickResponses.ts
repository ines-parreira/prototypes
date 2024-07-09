import {useCallback, useMemo} from 'react'
import {List} from 'immutable'

import {toImmutable} from 'common/utils'
import {trimHTML} from 'utils/html'
import {convertFromHTML, convertToHTML} from 'utils/editor'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
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
        (quickResponses: SelfServiceConfiguration['quickResponsePolicies']) => {
            const trimmedQuickResponses = quickResponses.map(
                (quickResponse) => {
                    const html = trimHTML(
                        quickResponse.responseMessageContent.html
                    )

                    return {
                        ...quickResponse,
                        responseMessageContent: {
                            ...quickResponse.responseMessageContent,
                            html: html.length
                                ? convertToHTML(convertFromHTML(html))
                                : html,
                            text: quickResponse.responseMessageContent.text.trim(),
                        },
                    }
                }
            )

            void handleSelfServiceConfigurationUpdate((draft) => {
                draft.quickResponsePolicies = trimmedQuickResponses
            })
        },
        [handleSelfServiceConfigurationUpdate]
    )
    const handleQuickResponsesDelete = useCallback(
        (quickResponses: SelfServiceConfiguration['quickResponsePolicies']) => {
            void handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.quickResponsePolicies = quickResponses
                },
                {success: 'Successfully deleted', error: 'Failed to delete'}
            )
        },
        [handleSelfServiceConfigurationUpdate]
    )
    const quickResponses = useMemo(
        () =>
            (selfServiceConfiguration?.quickResponsePolicies ?? []).map(
                (quickResponse) => ({
                    ...quickResponse,
                    responseMessageContent: {
                        ...quickResponse.responseMessageContent,
                        attachments: toImmutable<List<any>>(
                            quickResponse.responseMessageContent.attachments ??
                                []
                        ),
                    },
                })
            ),
        [selfServiceConfiguration?.quickResponsePolicies]
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
