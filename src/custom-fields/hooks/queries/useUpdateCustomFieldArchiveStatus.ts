import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment'

import { ObjectType } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPE_SETTINGS } from 'custom-fields/constants'
import {
    customFieldDefinitionKeys,
    useUpdatePartialCustomField,
} from 'custom-fields/hooks/queries/queries'
import { CustomField } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

export const useUpdateCustomFieldArchiveStatus = (
    id: number,
    objectType: ObjectType,
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const { mutate, mutateAsync, ...mutationQueryAPI } =
        useUpdatePartialCustomField({
            onSuccess: (_, [, { deactivated_datetime }]) => {
                void queryClient.invalidateQueries({
                    queryKey: customFieldDefinitionKeys.all(),
                })
                void dispatch(
                    notify({
                        message: `${
                            OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
                        } field has been successfully ${
                            deactivated_datetime
                                ? 'archived'
                                : 'moved to active'
                        }.`,
                        status: NotificationStatus.Success,
                    }),
                )
            },
            onError: (error, [, { deactivated_datetime }]) => {
                void dispatch(
                    notify({
                        title: `Failed to ${
                            !deactivated_datetime ? 'archive' : 'unarchive'
                        } ticket field.`,
                        message: errorToChildren(error) || undefined,
                        allowHTML: true,
                        status: NotificationStatus.Error,
                    }),
                )
            },
        })

    return {
        ...mutationQueryAPI,
        mutate: (archived: boolean) => {
            return mutate(onMutate(id, archived))
        },
        mutateAsync: (archived: boolean) => {
            return mutateAsync(onMutate(id, archived))
        },
    }
}

function onMutate(
    id: number,
    archived: boolean,
): [id: number, data: Partial<CustomField>] {
    return [
        id,
        {
            deactivated_datetime: archived ? moment.utc().toISOString() : null,
        },
    ]
}
