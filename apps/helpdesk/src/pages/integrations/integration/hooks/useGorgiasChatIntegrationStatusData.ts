import { useEffect } from 'react'

import type { Map } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatStatusEnum } from 'models/integration/types'
import { fetchChatIntegrationStatus } from 'state/integrations/actions'
import {
    getIsChatIntegrationStatusError,
    getIsChatIntegrationStatusLoading,
} from 'state/integrations/selectors'

/**
 * @todo: add tests
 */
export const useGorgiasChatIntegrationStatusData = (
    chat: Map<any, any>,
    isLoadingIntegrations = false,
    skipAutoFetch = false,
) => {
    const chatId = chat.get('id')
    const chatStatus: GorgiasChatStatusEnum | undefined = chat.getIn([
        'meta',
        'status',
    ])

    const dispatch = useAppDispatch()
    const isChatStatusLoading = useAppSelector(
        getIsChatIntegrationStatusLoading(chatId),
    )
    const isChatStatusError = useAppSelector(
        getIsChatIntegrationStatusError(chatId),
    )

    useEffect(() => {
        if (!isLoadingIntegrations && !chatStatus && !skipAutoFetch) {
            void dispatch(fetchChatIntegrationStatus(chatId))
        }
    }, [dispatch, chatId, chatStatus, isLoadingIntegrations, skipAutoFetch])

    return { chatStatus, isChatStatusLoading, isChatStatusError }
}
