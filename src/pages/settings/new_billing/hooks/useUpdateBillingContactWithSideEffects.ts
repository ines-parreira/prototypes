import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import { billingKeys, useUpdateBillingContact } from 'models/billing/queries'
import { updateBillingContact } from 'models/billing/resources'
import { UPDATE_BILLING_CONTACT_ERROR } from 'state/billing/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { MutationOverrides } from 'types/query'

export const useUpdateBillingContactWithSideEffects = (
    overrides?: MutationOverrides<typeof updateBillingContact>,
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useUpdateBillingContact({
        ...overrides,
        onSuccess: (response, ...args) => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Billing contact information updated',
                }),
            )

            void queryClient.invalidateQueries({
                queryKey: billingKeys.contact(),
            })

            return overrides?.onSuccess?.(response, ...args)
        },
        onError: (error, ...args) => {
            dispatch({
                type: UPDATE_BILLING_CONTACT_ERROR,
                error,
                reason: 'Unable to update billing contact information.',
                verbose: true,
            })

            return overrides?.onError?.(error, ...args)
        },
    })
}
