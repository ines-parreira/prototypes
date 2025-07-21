import { useQueryClient } from '@tanstack/react-query'

import { ObjectType } from '@gorgias/helpdesk-queries'

import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import {
    customFieldValueKeys,
    useDeleteCustomFieldValue,
    useUpdateCustomFieldValue,
} from 'custom-fields/hooks/queries/queries'
import {
    deleteCustomFieldValue,
    updateCustomFieldValue,
} from 'custom-fields/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { StoreDispatch } from 'state/types'
import { MutationOverrides } from 'types/query'
import { errorToChildren } from 'utils'

const createOnErrorHandler =
    (dispatch: StoreDispatch) => (error: Record<string, unknown>) => {
        void dispatch(
            notify({
                title: isGorgiasApiError(error)
                    ? error.response?.data.error.msg
                    : 'Failed to update customer field value. Please try again in a few seconds.',
                message: errorToChildren(error) || undefined,
                allowHTML: true,
                status: NotificationStatus.Error,
            }),
        )
    }

// Beware, we purposefully discarded the return type of the mutation
// to unknown, because updateCustomFieldValue and deleteCustomFieldValue have
// different return types and we don't want to deal with that in this hook.
export const useUpdateOrDeleteCustomerFieldValue = (
    providedOverrides: MutationOverrides<
        typeof updateCustomFieldValue & typeof deleteCustomFieldValue,
        true
    > = {},
    { isDisabled = false } = {},
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const internalErrorHandler = createOnErrorHandler(dispatch)
    const overrides = {
        onSuccess: (
            data: unknown,
            params: [{ fieldType: ObjectType; holderId: number }],
        ) => {
            void queryClient.invalidateQueries({
                queryKey: customFieldValueKeys.objectType(
                    params[0].fieldType,
                    params[0].holderId,
                ),
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

    const { mutate: updateMutate } = useUpdateCustomFieldValue(overrides)
    const { mutate: deleteMutate } = useDeleteCustomFieldValue(overrides)

    return {
        mutate: function mutate(
            params:
                | Parameters<typeof updateCustomFieldValue>
                | Parameters<typeof deleteCustomFieldValue>,
        ): unknown {
            if (isDisabled) return
            if (
                !('value' in params[0]) ||
                isCustomFieldValueEmpty(params[0].value)
            ) {
                return deleteMutate(params)
            }
            return updateMutate(params)
        },
    }
}
