import {useQueryClient} from '@tanstack/react-query'

import {OBJECT_TYPE_SETTINGS} from 'custom-fields/constants'
import {
    customFieldDefinitionKeys,
    useCreateCustomField,
} from 'custom-fields/hooks/queries/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {errorToChildren} from 'utils'

export const useCreateCustomFieldDefinition = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useCreateCustomField({
        onSuccess: (_, [data]) => {
            void queryClient.invalidateQueries({
                queryKey: customFieldDefinitionKeys.all(),
            })
            void dispatch(
                notify({
                    message: `${
                        OBJECT_TYPE_SETTINGS[data.object_type].TITLE_LABEL
                    } field created successfully.`,
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (error) => {
            void dispatch(
                notify({
                    title: isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Whoops, something went wrong',
                    message: errorToChildren(error) || undefined,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
