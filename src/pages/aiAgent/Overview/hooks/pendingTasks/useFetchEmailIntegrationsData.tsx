import {type List} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {type EmailIntegration} from 'models/integration/types'
import {getEmailIntegrations} from 'state/integrations/selectors'

export const useFetchEmailIntegrationsData = () => {
    const rawEmails: List<EmailIntegration> =
        useAppSelector(getEmailIntegrations)

    const mappedEmails = rawEmails
        .filter((i): i is EmailIntegration => !!i)
        .map((email) => ({
            id: email!.id,
            isDefault: email!.meta?.preferred,
            address: email!.meta?.address,
            isVerified: !!email!.meta?.verified,
        }))
        .toArray()

    return {
        data: mappedEmails,
        isLoading: false,
    }
}

export type EmailIntegrationsData = Exclude<
    Awaited<ReturnType<typeof useFetchEmailIntegrationsData>>['data'],
    null | undefined
>
