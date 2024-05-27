import {useMemo} from 'react'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import useSelfServiceStandaloneContactFormChannels from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCentersAutomationSettings'

export const useWorkflowsIdsEnabledInChat = (
    shopType: string,
    shopName: string
) => {
    const channels = useSelfServiceChatChannels(shopType, shopName)
    const appIds = useMemo(() => {
        return channels.map((channel) => channel.value.meta.app_id!)
    }, [channels])
    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(appIds)

    return useMemo(() => {
        const workflowIdsEnabled = new Set<string>()
        if (appIds.length === 0 || !applicationsAutomationSettings)
            return workflowIdsEnabled
        for (const settings of Object.values(applicationsAutomationSettings)) {
            const entrypoints = settings.workflows?.entrypoints ?? []
            entrypoints.forEach((workflow) => {
                if (workflow.enabled) {
                    workflowIdsEnabled.add(workflow.workflow_id)
                }
            })
        }

        return workflowIdsEnabled
    }, [appIds.length, applicationsAutomationSettings])
}
export const useWorkflowsIdsEnabledInHelpCenter = (
    shopType: string,
    shopName: string
) => {
    const channels = useSelfServiceHelpCenterChannels(shopType, shopName)
    const {client: helpCenterClient} = useHelpCenterApi()
    const helpCenterIds = useMemo(() => {
        return channels.map((channel) => channel.value.id)
    }, [channels])
    const {helpCentersAutomationSettings} =
        useHelpCentersAutomationSettings(helpCenterIds)

    return useMemo(() => {
        const workflowIdsEnabled = new Set<string>()
        if (
            helpCenterIds.length === 0 ||
            !helpCenterClient ||
            !helpCentersAutomationSettings
        )
            return workflowIdsEnabled
        for (const settings of Object.values(helpCentersAutomationSettings)) {
            const entrypoints = settings.workflows ?? []
            entrypoints.forEach((workflow) => {
                if (workflow.enabled) {
                    workflowIdsEnabled.add(workflow.id)
                }
            })
        }

        return workflowIdsEnabled
    }, [helpCenterClient, helpCenterIds.length, helpCentersAutomationSettings])
}

export const useWorkflowsIdsEnabledInContactForm = (
    shopType: string,
    shopName: string
) => {
    const channels = useSelfServiceStandaloneContactFormChannels(
        shopType,
        shopName
    )
    const contactFormIds = useMemo(() => {
        return channels.map((channel) => channel.value.id)
    }, [channels])
    const {contactFormsAutomationSettings} =
        useContactFormsAutomationSettings(contactFormIds)
    return useMemo(() => {
        const workflowIdsEnabled = new Set<string>()
        if (contactFormIds.length === 0 || !contactFormsAutomationSettings)
            return workflowIdsEnabled
        for (const settings of Object.values(contactFormsAutomationSettings)) {
            const entrypoints = settings.workflows ?? []
            entrypoints.forEach((workflow) => {
                if (workflow.enabled) {
                    workflowIdsEnabled.add(workflow.id)
                }
            })
        }

        return workflowIdsEnabled
    }, [contactFormIds.length, contactFormsAutomationSettings])
}
