import {createContext, useCallback, useContext, useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import useSelfServiceChannels, {
    SelfServiceChannelType,
} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import {fetchChatsApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/resources'
import {SelfServiceHelpCenterChannel} from 'pages/automation/common/hooks/useSelfServiceHelpCenterChannels'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {SelfServiceStandaloneContactFormChannel} from 'pages/automation/common/hooks/useSelfServiceStandaloneContactFormChannels'

import {WorkflowStep} from '../models/workflowConfiguration.types'
import {VisualBuilderNode} from '../models/visualBuilderGraph.types'

const allChannels: SelfServiceChannelType[] = [
    TicketChannel.Chat,
    TicketChannel.HelpCenter,
    TicketChannel.ContactForm,
]

type Workflow = {
    id: string
    steps: Array<{
        kind: WorkflowStep['kind']
    }>
}

type WorkflowChannelSupportContext = {
    isStepUnsupportedInAllChannels: (
        nodeType: NonNullable<VisualBuilderNode['type']>
    ) => boolean
    getUnsupportedConnectedChannels: (
        workflowId: string,
        nodeType: NonNullable<VisualBuilderNode['type']>
    ) => Promise<SelfServiceChannelType[]>
    getSupportedChannels: (
        type: VisualBuilderNode['type']
    ) => (
        | TicketChannel.Chat
        | TicketChannel.ContactForm
        | TicketChannel.HelpCenter
    )[]
    getUnsupportedChannels: (
        type: VisualBuilderNode['type']
    ) => (
        | TicketChannel.Chat
        | TicketChannel.ContactForm
        | TicketChannel.HelpCenter
    )[]
    getUnsupportedStepsNames: (
        channelType: SelfServiceChannelType,
        workflow: Workflow
    ) => string[]
}

export const WorkflowChannelSupportContext = createContext<
    WorkflowChannelSupportContext | undefined
>(undefined)

export function useWorkflowChannelSupportContext(): WorkflowChannelSupportContext {
    const context = useContext(WorkflowChannelSupportContext)
    if (!context) {
        throw new Error(
            'useWorkflowChannelSupportContext must be used within a WorkflowChannelSupportContext.Provider'
        )
    }
    return context
}

function useShopperInputSupportedChannels(): Set<SelfServiceChannelType> {
    const shopperInputSupportedChannelsRaw: string =
        useFlags()[FeatureFlagKey.FlowsStepsShopperInput] ?? ''
    return useMemo(() => {
        return new Set(
            shopperInputSupportedChannelsRaw
                .split(',')
                .map((channel) => {
                    if (channel === 'chat') return TicketChannel.Chat
                    if (channel === 'help-center')
                        return TicketChannel.HelpCenter
                    if (channel === 'contact-form')
                        return TicketChannel.ContactForm
                })
                .filter((c): c is SelfServiceChannelType => Boolean(c))
        )
    }, [shopperInputSupportedChannelsRaw])
}

function useGetChannelTypesWhereWorkflowIsEnabled(
    shopType: string,
    shopName: string
) {
    const channels = useSelfServiceChannels(shopType, shopName)
    const {client: helpCenterClient} = useHelpCenterApi()

    const workflowsIdsEnabledInChat = useMemo(async () => {
        const chatApplicationIds = channels
            .filter(
                (c): c is SelfServiceChatChannel =>
                    c.type === TicketChannel.Chat
            )
            .map((c) => c.value.meta.app_id!)
        const workflowIdsEnabled = new Set<string>()
        if (chatApplicationIds.length === 0) return workflowIdsEnabled
        const automationSettings =
            await fetchChatsApplicationAutomationSettings(
                chatApplicationIds
            ).catch(() => []) // do not block the UI in case of failure
        automationSettings.forEach((settings) => {
            const entrypoints = settings.workflows?.entrypoints ?? []
            entrypoints.forEach((workflow) => {
                if (workflow.enabled) {
                    workflowIdsEnabled.add(workflow.workflow_id)
                }
            })
        })
        return workflowIdsEnabled
    }, [channels])

    const workflowsIdsEnabledInHelpCenter = useMemo(async () => {
        const helpCenterIds = channels
            .filter(
                (c): c is SelfServiceHelpCenterChannel =>
                    c.type === TicketChannel.HelpCenter
            )
            .map((c) => c.value.id)
        const workflowIdsEnabled = new Set<string>()
        if (helpCenterIds.length === 0 || !helpCenterClient)
            return workflowIdsEnabled
        const automationSettings = await Promise.all(
            helpCenterIds.map(
                (help_center_id) =>
                    helpCenterClient
                        .getHelpCenterAutomationSettings({
                            help_center_id,
                        })
                        .catch(() => undefined) // do not block the UI in case of failure
            )
        )
        automationSettings.forEach((settings) => {
            settings?.data.workflows.forEach((workflow) => {
                if (workflow.enabled) {
                    workflowIdsEnabled.add(workflow.id)
                }
            })
        })
        return workflowIdsEnabled
    }, [channels, helpCenterClient])

    const workflowsIdsEnabledInContactForm = useMemo(async () => {
        const contactFormIds = channels
            .filter(
                (c): c is SelfServiceStandaloneContactFormChannel =>
                    c.type === TicketChannel.ContactForm
            )
            .map((c) => c.value.id)
        const workflowIdsEnabled = new Set<string>()
        if (contactFormIds.length === 0 || !helpCenterClient)
            return workflowIdsEnabled
        const automationSettings = await Promise.all(
            contactFormIds.map((id) =>
                helpCenterClient?.getContactFormAutomationSettings({
                    id,
                })
            )
        ).catch(() => []) // do not block the UI in case of failure
        automationSettings.forEach((settings) => {
            settings?.data.workflows.forEach((workflow) => {
                if (workflow.enabled) {
                    workflowIdsEnabled.add(workflow.id)
                }
            })
        })
        return workflowIdsEnabled
    }, [channels, helpCenterClient])

    return useCallback(
        async (workflowId: string) => {
            const channelsWhereEnabled: SelfServiceChannelType[] = []
            if ((await workflowsIdsEnabledInChat).has(workflowId)) {
                channelsWhereEnabled.push(TicketChannel.Chat)
            }
            if ((await workflowsIdsEnabledInHelpCenter).has(workflowId)) {
                channelsWhereEnabled.push(TicketChannel.HelpCenter)
            }
            if ((await workflowsIdsEnabledInContactForm).has(workflowId)) {
                channelsWhereEnabled.push(TicketChannel.ContactForm)
            }
            return channelsWhereEnabled
        },
        [
            workflowsIdsEnabledInChat,
            workflowsIdsEnabledInHelpCenter,
            workflowsIdsEnabledInContactForm,
        ]
    )
}

export default function useWorkflowChannelSupport(
    shopType: string,
    shopName: string
): WorkflowChannelSupportContext {
    const shopperInputSupportedChannels = useShopperInputSupportedChannels()
    const getChannelTypesWhereWorkflowIsEnabled =
        useGetChannelTypesWhereWorkflowIsEnabled(shopType, shopName)

    const getUnsupportedConnectedChannels: (
        workflowId: string,
        nodeType: NonNullable<VisualBuilderNode['type']>
    ) => Promise<SelfServiceChannelType[]> = useCallback(
        async (workflowId, nodeType) => {
            if (!['text_reply', 'file_upload'].includes(nodeType)) return []
            const embeddingChannels =
                await getChannelTypesWhereWorkflowIsEnabled(workflowId)
            const unsupportedChannels = embeddingChannels.filter(
                (c) => !shopperInputSupportedChannels.has(c)
            )
            return unsupportedChannels
        },
        [getChannelTypesWhereWorkflowIsEnabled, shopperInputSupportedChannels]
    )

    const getSupportedChannels = useCallback(
        (nodeType: VisualBuilderNode['type']) => {
            if (nodeType === 'text_reply' || nodeType === 'file_upload') {
                return allChannels.filter((c) =>
                    shopperInputSupportedChannels.has(c)
                )
            }
            return []
        },
        [shopperInputSupportedChannels]
    )

    const getUnsupportedChannels = useCallback(
        (nodeType: VisualBuilderNode['type']) => {
            if (nodeType === 'text_reply' || nodeType === 'file_upload') {
                return allChannels.filter(
                    (c) => !shopperInputSupportedChannels.has(c)
                )
            }
            return []
        },
        [shopperInputSupportedChannels]
    )

    const getUnsupportedStepsNames = useCallback(
        (channelType: SelfServiceChannelType, workflow: Workflow) => {
            if (
                workflow.steps.find(
                    (s) =>
                        s.kind === 'text-input' ||
                        s.kind === 'attachments-input'
                )
            ) {
                if (!shopperInputSupportedChannels.has(channelType)) {
                    return ['collect text reply', 'collect file upload']
                }
            }
            return []
        },
        [shopperInputSupportedChannels]
    )

    const isStepUnsupportedInAllChannels = useCallback(
        (nodeType: VisualBuilderNode['type']) => {
            if (nodeType === 'text_reply' || nodeType === 'file_upload') {
                const unsupportedChannels = getUnsupportedChannels(nodeType)
                return allChannels.every((c) => unsupportedChannels.includes(c))
            }
            return false
        },
        [getUnsupportedChannels]
    )

    return useMemo(
        () => ({
            isStepUnsupportedInAllChannels,
            getUnsupportedConnectedChannels,
            getSupportedChannels,
            getUnsupportedChannels,
            getUnsupportedStepsNames,
        }),
        [
            isStepUnsupportedInAllChannels,
            getUnsupportedConnectedChannels,
            getSupportedChannels,
            getUnsupportedChannels,
            getUnsupportedStepsNames,
        ]
    )
}

export function createWorkflowChannelSupportContextForPreview(): WorkflowChannelSupportContext {
    return {
        isStepUnsupportedInAllChannels: () => false,
        getUnsupportedConnectedChannels: () => Promise.resolve([]),
        getSupportedChannels: () => [],
        getUnsupportedChannels: () => [],
        getUnsupportedStepsNames: () => [],
    }
}

export function getChannelName(channel: SelfServiceChannelType): string {
    switch (channel) {
        case TicketChannel.Chat:
            return 'Chat'
        case TicketChannel.HelpCenter:
            return 'Help Center'
        case TicketChannel.ContactForm:
            return 'Contact Form'
    }
}
