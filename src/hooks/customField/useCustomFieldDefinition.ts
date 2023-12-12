import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import {useGetCustomFieldDefinition} from 'models/customField/queries'
import {CustomField} from 'models/customField/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldDefinition = (id: number) => {
    const dispatch = useAppDispatch()
    return useGetCustomFieldDefinition<CustomField>(id, {
        staleTime: STALE_TIME_MS,
        select: (data) => data.data,
        refetchOnWindowFocus: false,
        onError: () => {
            void dispatch(
                notify({
                    message: 'Failed to fetch custom field',
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
