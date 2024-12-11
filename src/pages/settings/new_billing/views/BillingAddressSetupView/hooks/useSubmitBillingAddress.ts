import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import type {updateBillingContact} from 'models/billing/resources'
import {useUpdateBillingContactWithSideEffects} from 'pages/settings/new_billing/hooks/useUpdateBillingContactWithSideEffects'
import type {MutationOverrides} from 'types/query'
import {reportError} from 'utils/errors'

export const useSubmitBillingAddress = (
    overrides?: MutationOverrides<typeof updateBillingContact>
) => {
    return useUpdateBillingContactWithSideEffects({
        ...overrides,
        onError: (error, ...args) => {
            overrides?.onError?.(error, ...args)

            reportError(error, {
                tags: {team: CRM_GROWTH_SENTRY_TEAM},
                extra: {
                    context: `Failed to submit billing contact`,
                },
            })
        },
    })
}
