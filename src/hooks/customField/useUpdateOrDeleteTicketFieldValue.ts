import {useQueryClient} from '@tanstack/react-query'

import {useEffect} from 'react'
import {errorToChildren} from 'utils'
import {isCustomFieldValueEmpty} from 'utils/customFields'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {StoreDispatch} from 'state/types'
import {NotificationStatus} from 'state/notifications/types'
import {
    deleteCustomFieldValue,
    updateCustomFieldValue,
} from 'models/customField/resources'
import {updateCustomFieldPrediction} from 'state/ticket/actions'
import {MutationOverrides} from 'types/query'
import {
    customFieldValueKeys,
    useUpdateCustomFieldValue,
    useDeleteCustomFieldValue,
} from 'models/customField/queries'

const onErrorCreator =
    (dispatch: StoreDispatch) => (error: Record<string, unknown>) => {
        void dispatch(
            notify({
                title: `Failed to update ticket field value. Please try again in a few seconds.`,
                message: errorToChildren(error) || undefined,
                allowHTML: true,
                status: NotificationStatus.Error,
            })
        )
    }

// This is only doable because we know that delete extends update params
// And we don’t need to type the return value because we don’t use it
export const useUpdateOrDeleteTicketFieldValue = (
    providedOverrides: MutationOverrides<
        typeof updateCustomFieldValue & typeof deleteCustomFieldValue,
        true
    > = {},
    {isDisabled = false} = {}
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const internalErrorHandler = onErrorCreator(dispatch)
    const overrides = {
        onSuccess: (data: unknown, params: [{fieldId: number}]) => {
            // queryClient.setQueryData(customFieldValueKeys.value(params[0].id), {...})
            // or the following if we ever fetch value with react query
            void queryClient.invalidateQueries({
                queryKey: customFieldValueKeys.value(params[0].fieldId),
            })
        },
        ...providedOverrides,
        // this onError should not be overridden because it has custom logic
        onError: (
            ...args: Parameters<
                Exclude<typeof providedOverrides.onError, undefined>
            >
        ) => {
            internalErrorHandler(args[0])
            providedOverrides.onError?.(...args)
        },
    }

    const {mutate: updateMutate, data: updateData} =
        useUpdateCustomFieldValue(overrides)
    const {mutate: deleteMutate} = useDeleteCustomFieldValue(overrides)

    useEffect(() => {
        if (updateData?.data.prediction) {
            const {field, prediction} = updateData.data
            dispatch(updateCustomFieldPrediction(field.id, prediction))
        }
    }, [updateData, dispatch])

    return {
        mutate: (
            params: Parameters<typeof updateCustomFieldValue> &
                Parameters<typeof deleteCustomFieldValue>
        ) => {
            if (isDisabled) return
            if (isCustomFieldValueEmpty(params[0].value)) {
                return deleteMutate(params)
            }
            return updateMutate(params)
        },
    }
}
