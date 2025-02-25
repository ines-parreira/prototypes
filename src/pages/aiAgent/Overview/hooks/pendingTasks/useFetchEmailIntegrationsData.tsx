import { useMemo } from 'react'

import { type Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { type EmailIntegration } from 'models/integration/types'
import { getEmailIntegrations } from 'state/integrations/selectors'

export const useFetchEmailIntegrationsData = () => {
    const rawEmails = useAppSelector(getEmailIntegrations)

    const mappedEmails = useMemo(() => {
        return rawEmails
            .map((email: Map<string, any>) => email.toJS() as EmailIntegration)
            .filter((i): i is EmailIntegration => !!i)
            .map((email) => ({
                id: email!.id,
                isDefault: email!.meta?.preferred,
                address: email!.meta?.address,
                isVerified: !!email!.meta?.verified,
            }))
            .toArray()
    }, [rawEmails])

    return {
        data: mappedEmails,
    }
}

export type EmailIntegrationsData = Exclude<
    Awaited<ReturnType<typeof useFetchEmailIntegrationsData>>['data'],
    null | undefined
>
