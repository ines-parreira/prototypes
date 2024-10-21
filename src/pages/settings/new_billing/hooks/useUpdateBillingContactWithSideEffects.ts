import {useQueryClient} from '@tanstack/react-query'
import {billingKeys, useUpdateBillingContact} from 'models/billing/queries'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    UPDATE_BILLING_CONTACT_ERROR,
    UPDATE_BILLING_CONTACT_SUCCESS,
} from 'state/billing/constants'
import {updateBillingContact} from 'models/billing/resources'
import {MutationOverrides} from 'types/query'
import useAppDispatch from 'hooks/useAppDispatch'

export const useUpdateBillingContactWithSideEffects = (
    overrides?: MutationOverrides<typeof updateBillingContact>
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
                })
            )

            void queryClient.invalidateQueries({
                queryKey: billingKeys.contact(),
            })

            dispatch({
                type: UPDATE_BILLING_CONTACT_SUCCESS,
                billingContact: response.data,
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
