import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import {useGetCustomFieldDefinition} from 'models/customField/queries'
import {CustomField} from 'models/customField/types'

export const useCustomFieldDefinition = (id: number) => {
    const dispatch = useAppDispatch()
    return useGetCustomFieldDefinition<CustomField>(id, {
        select: (data) => data.data,
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
