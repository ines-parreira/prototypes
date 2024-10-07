import {useQueryClient} from '@tanstack/react-query'

import {errorToChildren} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    customFieldDefinitionKeys,
    useUpdateCustomField,
} from 'custom-fields/hooks/queries/queries'
import {isGorgiasApiError} from 'models/api/types'

export const useUpdateCustomFieldDefinition = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useUpdateCustomField({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: customFieldDefinitionKeys.all(),
            })
            void dispatch(
                notify({
                    message: 'Ticket field updated successfully.',
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (error) => {
            void dispatch(
                notify({
                    title: isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Oups something went wrong',
                    message: errorToChildren(error) || undefined,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
