import { useMemo } from 'react'

import { IntegrationType } from '@gorgias/helpdesk-client'

import useAllIntegrations from 'hooks/useAllIntegrations'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import { isBaseEmailIntegration } from 'pages/integrations/integration/components/email/helpers'

import { EmailOption } from '../EmailMultiselect'

const isEmailIntegrationType = (type: IntegrationType): boolean => {
    return (
        [
            IntegrationType.Email,
            IntegrationType.Gmail,
            IntegrationType.Outlook,
        ] as IntegrationType[]
    ).includes(type)
}

export const useEmailIntegrations = (): EmailOption[] => {
    const { integrations: allIntegrations, isLoading } = useAllIntegrations()

    const emailOptions = useMemo(() => {
        if (isLoading || !allIntegrations) {
            return []
        }

        return allIntegrations
            .filter((integration) => {
                if (!isEmailIntegrationType(integration.type)) {
                    return false
                }

                if (!integration.meta?.address) {
                    return false
                }

                if (integration.type === IntegrationType.Email) {
                    const isBase = isBaseEmailIntegration(
                        integration as
                            | EmailIntegration
                            | GmailIntegration
                            | OutlookIntegration,
                    )
                    if (isBase) {
                        return false
                    }
                }

                return true
            })
            .map((integration) => ({
                provider: integration.type as EmailOption['provider'],
                email: integration.meta.address as string,
            }))
    }, [allIntegrations, isLoading])

    return emailOptions
}
