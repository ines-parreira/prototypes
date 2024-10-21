import {useHistory} from 'react-router-dom'
import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {BILLING_PAYMENT_PATH} from 'pages/settings/new_billing/constants'
import {reportError} from 'utils/errors'
import {useUpdateBillingContactWithSideEffects} from 'pages/settings/new_billing/hooks/useUpdateBillingContactWithSideEffects'

export const useSubmitBillingAddress = () => {
    const history = useHistory()

    return useUpdateBillingContactWithSideEffects({
        onSuccess: () => {
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
