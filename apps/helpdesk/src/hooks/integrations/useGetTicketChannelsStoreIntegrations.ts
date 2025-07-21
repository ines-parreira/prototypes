import { useMemo } from 'react'

import { useGetAiAgentIntegrations } from 'hooks/aiAgent/useGetAiAgentIntegrations'
import { useGetChatIntegrationIdsForStore } from 'hooks/chat/useGetChatIntegrationIdsForStore'
import { useGetContactFromIntegrationIdsForStore } from 'hooks/contacForm/useGetContactForms'
import {
    useGetEmail,
    useGetEmailIntegrationsWithStoreName,
} from 'hooks/email/useGetEmail'
import { useGetHelpCentersIntegrationIdsForStore } from 'hooks/helpCenter/useGetStoreHelpCenters'

export const useGetTicketChannelsStoreIntegrations = (shopName: string) => {
    // HELP CENTER
    const {
        helpCentersIntegrationsWithName,
        helpCentersIntegrationsWithoutName,
    } = useGetHelpCentersIntegrationIdsForStore({ shopName })

    // CONTACT FORM
    const {
        contactFormIntegrationsWithName,
        contactFormIntegrationsWithoutName,
    } = useGetContactFromIntegrationIdsForStore({ shopName })

    // EMAIL
    const { emailIntegrationsWithoutName } = useGetEmail()
    const integrationsList = useMemo(() => {
        return [
            ...helpCentersIntegrationsWithoutName,
            ...contactFormIntegrationsWithoutName,
            ...emailIntegrationsWithoutName,
        ]
    }, [
        helpCentersIntegrationsWithoutName,
        contactFormIntegrationsWithoutName,
        emailIntegrationsWithoutName,
    ])
    const emailIntegrationsWithStoreNamePerStore =
        useGetEmailIntegrationsWithStoreName({
            integrations: integrationsList,
            shopName,
        })

    // CHAT
    const chatChannels = useGetChatIntegrationIdsForStore({ shopName })
    const additionalAiAgentIntegrations = useGetAiAgentIntegrations()

    const integrations = useMemo(() => {
        return [
            ...helpCentersIntegrationsWithName,
            ...contactFormIntegrationsWithName,
            ...chatChannels,
            ...additionalAiAgentIntegrations,
            ...emailIntegrationsWithStoreNamePerStore,
        ]
            .filter(Boolean)
            .map(({ id, channel }) => `${channel}::${id}`)
    }, [
        helpCentersIntegrationsWithName,
        contactFormIntegrationsWithName,
        chatChannels,
        additionalAiAgentIntegrations,
        emailIntegrationsWithStoreNamePerStore,
    ])

    if (integrations.length === 0) {
        return ['none::-1']
    }

    return integrations
}
