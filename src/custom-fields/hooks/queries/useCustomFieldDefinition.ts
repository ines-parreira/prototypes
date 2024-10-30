import {useGetCustomFieldDefinition} from 'custom-fields/hooks/queries/queries'
import {CustomField} from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const STALE_TIME_MS = 60 * 60 * 1000 // 1 hour

export const useCustomFieldDefinition = (
    id: number,
    overrides?: Parameters<typeof useGetCustomFieldDefinition>[1]
) => {
    const dispatch = useAppDispatch()
    return useGetCustomFieldDefinition<CustomField>(id, {
        ...overrides,
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
