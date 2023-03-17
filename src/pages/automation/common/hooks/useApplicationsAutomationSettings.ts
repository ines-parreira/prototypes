import {useEffect} from 'react'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    fetchChatsApplicationAutomationSettings,
    upsertChatApplicationAutomationSettings,
} from 'models/chatApplicationAutomationSettings/resources'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'
import {
    chatApplicationAutomationSettingsUpdated,
    chatsApplicationAutomationSettingsFetched,
} from 'state/entities/chatsApplicationAutomationSettings/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ChatApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/types'

const useApplicationsAutomationSettings = (applicationsIds: string[]) => {
    const dispatch = useAppDispatch()

    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings
    )

    const [
        {loading: isFetchPending},
        handleChatsApplicationAutomationSettingsFetch,
    ] = useAsyncFn(async (applicationsIds: string[]) => {
        try {
            const res = await fetchChatsApplicationAutomationSettings(
                applicationsIds
            )

            void dispatch(chatsApplicationAutomationSettingsFetched(res))
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch',
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [])

    const [
        {loading: isUpdatePending},
        handleChatApplicationAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (
            applicationAutomationSettings: ChatApplicationAutomationSettings
        ) => {
            try {
                const {articleRecommendation, quickResponses, orderManagement} =
                    applicationAutomationSettings

                const res = await upsertChatApplicationAutomationSettings(
                    applicationAutomationSettings.applicationId.toString(),
                    {articleRecommendation, quickResponses, orderManagement}
                )

                void dispatch(chatApplicationAutomationSettingsUpdated(res))

                void dispatch(
                    notify({
                        message: 'Successfully updated',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to update',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        []
    )

    useEffect(() => {
        const valuesMissing = applicationsIds.filter(
            (id) => !(id in applicationsAutomationSettings)
        )

        if (valuesMissing.length) {
            void handleChatsApplicationAutomationSettingsFetch(valuesMissing)
        }
    }, [
        applicationsIds,
        applicationsAutomationSettings,
        handleChatsApplicationAutomationSettingsFetch,
    ])

    return {
        isFetchPending,
        isUpdatePending,
        applicationsAutomationSettings,
        handleChatsApplicationAutomationSettingsFetch,
        handleChatApplicationAutomationSettingsUpdate,
    }
}

export default useApplicationsAutomationSettings
