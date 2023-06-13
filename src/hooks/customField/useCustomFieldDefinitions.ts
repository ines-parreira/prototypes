import {
    GetCustomFieldDefinitionsResponse,
    ListParams,
} from 'models/customField/types'
import {useGetCustomFieldDefinitions} from 'models/customField/queries'
import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldDefinitions = (params: ListParams) => {
    const dispatch = useAppDispatch()
    return useGetCustomFieldDefinitions<GetCustomFieldDefinitionsResponse>(
        params,
        {
            staleTime: STALE_TIME_MS,
            select: (data) => data.data,
            onError: () => {
                void dispatch(
                    notify({
                        message: 'Failed to fetch ticket custom fields list',
                        status: NotificationStatus.Error,
                    })
                )
            },
        }
    )
}
