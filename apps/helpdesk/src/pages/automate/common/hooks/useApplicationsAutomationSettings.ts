import { useAsyncFn } from '@repo/hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetChatsApplicationAutomationSettings } from 'models/automation/queries'
import { upsertChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/resources'
import { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'
import {
    chatApplicationAutomationSettingsUpdated,
    chatsApplicationAutomationSettingsFetched,
} from 'state/entities/chatsApplicationAutomationSettings/actions'
import { getChatsApplicationAutomationSettings } from 'state/entities/chatsApplicationAutomationSettings/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useApplicationsAutomationSettings = (applicationsIds: string[]) => {
    const dispatch = useAppDispatch()

    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings,
    )

    const { isLoading } = useGetChatsApplicationAutomationSettings(
        applicationsIds,
        {
            enabled: Boolean(applicationsIds.length),
            onSettled: (data) => {
                if (data) {
                    void dispatch(
                        chatsApplicationAutomationSettingsFetched(data),
                    )
                    return data
                }
            },
            onError: () => {
                void dispatch(
                    notify({
                        message: 'Failed to fetch',
                        status: NotificationStatus.Error,
                    }),
                )
            },
        },
    )

    const [
        { loading: isUpdatePending },
        handleChatApplicationAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (
            applicationAutomationSettings: ChatApplicationAutomationSettings,
            notificationMessage?: string,
            silentNotification?: boolean,
        ) => {
            try {
                const { articleRecommendation, orderManagement, workflows } =
                    applicationAutomationSettings

                const res = await upsertChatApplicationAutomationSettings(
                    applicationAutomationSettings.applicationId.toString(),
                    {
                        articleRecommendation,
                        orderManagement,
                        workflows,
                    },
                )

                void dispatch(chatApplicationAutomationSettingsUpdated(res))

                if (silentNotification) {
                    return
                }
                void dispatch(
                    notify({
                        message: notificationMessage ?? 'Successfully updated',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch {
                if (silentNotification) {
                    return
                }
                void dispatch(
                    notify({
                        message: 'Failed to update',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [],
    )

    return {
        isUpdatePending,
        isFetchPending: isLoading,
        applicationsAutomationSettings,
        handleChatApplicationAutomationSettingsUpdate,
    }
}

export default useApplicationsAutomationSettings
