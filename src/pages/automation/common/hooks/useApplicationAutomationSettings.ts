import {useAsyncFn, useDeepCompareEffect} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {fetchChatsApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/resources'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'
import {chatsApplicationAutomationSettingsFetched} from 'state/entities/chatsApplicationAutomationSettings/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

const useApplicationAutomationSettings = (applicationsIds: string[]) => {
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

    useDeepCompareEffect(() => {
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
        applicationsAutomationSettings,
        handleChatsApplicationAutomationSettingsFetch,
    }
}

export default useApplicationAutomationSettings
