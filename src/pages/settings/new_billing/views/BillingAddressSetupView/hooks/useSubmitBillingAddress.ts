import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useQueryClient} from '@tanstack/react-query'
import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {billingKeys, useUpdateBillingContact} from 'models/billing/queries'
import {BILLING_PAYMENT_PATH} from 'pages/settings/new_billing/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import {UPDATE_BILLING_CONTACT_SUCCESS} from 'state/billing/constants'

export const useSubmitBillingAddress = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const queryClient = useQueryClient()

    return useUpdateBillingContact({
        onSuccess: (response) => {
            dispatch(
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

            history.push(BILLING_PAYMENT_PATH)
        },
        onError: (error) => {
            reportError(error, {
                tags: {team: CRM_GROWTH_SENTRY_TEAM},
                extra: {
                    context: `Failed to submit billing contact`,
                },
            })
        },
    })
}
