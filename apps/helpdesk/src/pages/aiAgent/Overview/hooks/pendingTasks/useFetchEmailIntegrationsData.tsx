import { useMemo } from 'react'

import type { Map } from 'immutable'

import type {
    EmailIntegration,
    GmailIntegration,
} from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import type { OutlookIntegration } from 'models/integration/types'
import {
    EmailVerificationStatus,
    getEmailVerificationStatus,
} from 'pages/integrations/integration/components/email/getEmailVerificationStatus'
import { getEmailIntegrations } from 'state/integrations/selectors'

export const useFetchEmailIntegrationsData = () => {
    const rawEmails = useAppSelector(getEmailIntegrations)

    const mappedEmails = useMemo(() => {
        return rawEmails
            .map((emailIntegrationMap: Map<string, any>) => {
                const email = emailIntegrationMap.toJS() as
                    | EmailIntegration
                    | GmailIntegration
                    | OutlookIntegration

                const verificationStatus = getEmailVerificationStatus(email)

                return {
                    id: email.id,
                    isDefault: email.meta?.preferred,
                    address: email.meta?.address,
                    isVerified:
                        verificationStatus === EmailVerificationStatus.Verified,
                }
            })
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
