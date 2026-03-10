import { createContext, useCallback, useContext, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'

import type { VisualBuilderNode } from '../models/visualBuilderGraph.types'
import type { WfConfigurationResponseDto } from '../types'
import {
    useWorkflowsIdsEnabledInChat,
    useWorkflowsIdsEnabledInContactForm,
    useWorkflowsIdsEnabledInHelpCenter,
} from './useWorkflowEnabledInChannels'

const allChannels: SelfServiceChannelType[] = [
    TicketChannel.Chat,
    TicketChannel.HelpCenter,
    TicketChannel.ContactForm,
]

export const optionalNodeTypes: NonNullable<VisualBuilderNode['type']>[] = [
    'text_reply',
    'file_upload',
    'order_selection',
    'shopper_authentication',
    'http_request',
    'conditions',
    'order_line_item_selection',
]

type WorkflowSteps = WfConfigurationResponseDto['steps'][number]
type Workflow = {
    id: WfConfigurationResponseDto['id']
    steps: Array<{
        kind: WorkflowSteps['kind']
    }>
}
type WorkflowChannelSupportContext = {
    isStepUnsupportedInAllChannels: (
        nodeType: NonNullable<VisualBuilderNode['type']>,
    ) => boolean
    getUnsupportedConnectedChannels: (
        workflowId: string,
        nodeType: NonNullable<VisualBuilderNode['type']>,
    ) => SelfServiceChannelType[]
    getSupportedChannels: (
        type: VisualBuilderNode['type'],
    ) => (
        | TicketChannel.Chat
        | TicketChannel.ContactForm
        | TicketChannel.HelpCenter
    )[]
    getUnsupportedChannels: (
        type: VisualBuilderNode['type'],
    ) => (
        | TicketChannel.Chat
        | TicketChannel.ContactForm
        | TicketChannel.HelpCenter
    )[]
    getUnsupportedNodeTypes: (
        channelType: SelfServiceChannelType,
        workflow: Workflow,
    ) => Array<NonNullable<VisualBuilderNode['type']>>
}

export const WorkflowChannelSupportContext = createContext<
    WorkflowChannelSupportContext | undefined
>(undefined)

export function useWorkflowChannelSupportContext(): WorkflowChannelSupportContext {
    const context = useContext(WorkflowChannelSupportContext)
    if (!context) {
        throw new Error(
            'useWorkflowChannelSupportContext must be used within a WorkflowChannelSupportContext.Provider',
        )
    }
    return context
}

function useSupportedChannelsFromFeatureFlag(
    featureFlag:
        | FeatureFlagKey.FlowsStepsShopperInput
        | FeatureFlagKey.FlowsStepsOrderSelection
        | FeatureFlagKey.FlowsStepsShopperAuthentication
        | FeatureFlagKey.FlowsStepsOrderLineItemSelection,
): Set<SelfServiceChannelType> {
    const flagValue = useFlag(featureFlag)
    const supportedChannelsRaw = typeof flagValue === 'string' ? flagValue : ''

    return useMemo(() => {
        return new Set(
            supportedChannelsRaw
                .split(',')
                .map((channel) => {
                    if (channel === 'chat') return TicketChannel.Chat
                    if (channel === 'help-center')
                        return TicketChannel.HelpCenter
                    if (channel === 'contact-form')
                        return TicketChannel.ContactForm
                })
                .filter((c): c is SelfServiceChannelType => Boolean(c)),
        )
    }, [supportedChannelsRaw])
}

function useShopperInputSupportedChannels(): Set<SelfServiceChannelType> {
    return useSupportedChannelsFromFeatureFlag(
        FeatureFlagKey.FlowsStepsShopperInput,
    )
}

function useOrderSelectionSupportedChannels(): Set<SelfServiceChannelType> {
    return useSupportedChannelsFromFeatureFlag(
        FeatureFlagKey.FlowsStepsOrderSelection,
    )
}

function useShopperAuthenticationSupportedChannels(): Set<SelfServiceChannelType> {
    return useSupportedChannelsFromFeatureFlag(
        FeatureFlagKey.FlowsStepsShopperAuthentication,
    )
}

function useOrderLineItemSelectionSupportedChannels(): Set<SelfServiceChannelType> {
    return useSupportedChannelsFromFeatureFlag(
        FeatureFlagKey.FlowsStepsOrderLineItemSelection,
    )
}

function useGetChannelTypesWhereWorkflowIsEnabled(
    shopType: string,
    shopName: string,
) {
    const workflowsIdsEnabledInChat = useWorkflowsIdsEnabledInChat(
        shopType,
        shopName,
    )

    const workflowsIdsEnabledInHelpCenter = useWorkflowsIdsEnabledInHelpCenter(
        shopType,
        shopName,
    )

    const workflowsIdsEnabledInContactForm =
        useWorkflowsIdsEnabledInContactForm(shopType, shopName)

    return useCallback(
        (workflowId: string) => {
            const channelsWhereEnabled: SelfServiceChannelType[] = []
            if (workflowsIdsEnabledInChat.has(workflowId)) {
                channelsWhereEnabled.push(TicketChannel.Chat)
            }
            if (workflowsIdsEnabledInHelpCenter.has(workflowId)) {
                channelsWhereEnabled.push(TicketChannel.HelpCenter)
            }
            if (workflowsIdsEnabledInContactForm.has(workflowId)) {
                channelsWhereEnabled.push(TicketChannel.ContactForm)
            }
            return channelsWhereEnabled
        },
        [
            workflowsIdsEnabledInChat,
            workflowsIdsEnabledInHelpCenter,
            workflowsIdsEnabledInContactForm,
        ],
    )
}

export default function useWorkflowChannelSupport(
    shopType: string,
    shopName: string,
): WorkflowChannelSupportContext {
    const shopperInputSupportedChannels = useShopperInputSupportedChannels()
    const orderSelectionSupportedChannels = useOrderSelectionSupportedChannels()
    const shopperAuthenticationSupportedChannels =
        useShopperAuthenticationSupportedChannels()
    const orderLineItemSelectionSupportedChannels =
        useOrderLineItemSelectionSupportedChannels()

    const getChannelTypesWhereWorkflowIsEnabled =
        useGetChannelTypesWhereWorkflowIsEnabled(shopType, shopName)

    const getUnsupportedConnectedChannels: (
        workflowId: string,
        nodeType: NonNullable<VisualBuilderNode['type']>,
    ) => SelfServiceChannelType[] = useCallback(
        (workflowId, nodeType) => {
            if (!optionalNodeTypes.includes(nodeType)) return []
            const embeddingChannels =
                getChannelTypesWhereWorkflowIsEnabled(workflowId)
            if (nodeType === 'text_reply' || nodeType === 'file_upload') {
                return embeddingChannels.filter(
                    (c) => !shopperInputSupportedChannels.has(c),
                )
            }
            if (nodeType === 'order_selection') {
                return embeddingChannels.filter(
                    (c) => !orderSelectionSupportedChannels.has(c),
                )
            }

            if (nodeType === 'shopper_authentication') {
                return embeddingChannels.filter(
                    (c) => !shopperAuthenticationSupportedChannels.has(c),
                )
            }

            if (nodeType === 'order_line_item_selection') {
                return embeddingChannels.filter(
                    (c) => !orderLineItemSelectionSupportedChannels.has(c),
                )
            }

            return []
        },
        [
            getChannelTypesWhereWorkflowIsEnabled,
            shopperInputSupportedChannels,
            orderSelectionSupportedChannels,
            shopperAuthenticationSupportedChannels,
            orderLineItemSelectionSupportedChannels,
        ],
    )

    const getSupportedChannels = useCallback(
        (nodeType: VisualBuilderNode['type']) => {
            if (nodeType === 'text_reply' || nodeType === 'file_upload') {
                return allChannels.filter((c) =>
                    shopperInputSupportedChannels.has(c),
                )
            }
            if (nodeType === 'order_selection') {
                return allChannels.filter((c) =>
                    orderSelectionSupportedChannels.has(c),
                )
            }

            if (nodeType === 'shopper_authentication') {
                return allChannels.filter((c) =>
                    shopperAuthenticationSupportedChannels.has(c),
                )
            }

            if (nodeType === 'order_line_item_selection') {
                return allChannels.filter((c) =>
                    orderLineItemSelectionSupportedChannels.has(c),
                )
            }

            return []
        },
        [
            shopperInputSupportedChannels,
            orderSelectionSupportedChannels,
            shopperAuthenticationSupportedChannels,
            orderLineItemSelectionSupportedChannels,
        ],
    )

    const getUnsupportedChannels = useCallback(
        (nodeType: VisualBuilderNode['type']) => {
            if (nodeType === 'text_reply' || nodeType === 'file_upload') {
                return allChannels.filter(
                    (c) => !shopperInputSupportedChannels.has(c),
                )
            }
            if (nodeType === 'order_selection') {
                return allChannels.filter(
                    (c) => !orderSelectionSupportedChannels.has(c),
                )
            }
            if (nodeType === 'shopper_authentication') {
                return allChannels.filter(
                    (c) => !shopperAuthenticationSupportedChannels.has(c),
                )
            }
            if (nodeType === 'order_line_item_selection') {
                return allChannels.filter(
                    (c) => !orderLineItemSelectionSupportedChannels.has(c),
                )
            }

            return []
        },
        [
            shopperInputSupportedChannels,
            orderSelectionSupportedChannels,
            shopperAuthenticationSupportedChannels,
            orderLineItemSelectionSupportedChannels,
        ],
    )

    const getUnsupportedNodeTypes = useCallback(
        (
            channelType: SelfServiceChannelType,
            workflow: Workflow,
        ): Array<NonNullable<VisualBuilderNode['type']>> => {
            if (
                workflow.steps.find(
                    (s) =>
                        s.kind === 'text-input' ||
                        s.kind === 'attachments-input',
                )
            ) {
                if (!shopperInputSupportedChannels.has(channelType)) {
                    return ['text_reply', 'file_upload']
                }
            }

            if (
                workflow.steps.find((s) => s.kind === 'shopper-authentication')
            ) {
                if (!shopperAuthenticationSupportedChannels.has(channelType)) {
                    return ['shopper_authentication']
                }
            }

            if (workflow.steps.find((s) => s.kind === 'order-selection')) {
                if (!orderSelectionSupportedChannels.has(channelType)) {
                    return ['order_selection']
                }
            }

            if (
                workflow.steps.find(
                    (s) => s.kind === 'order-line-item-selection',
                )
            ) {
                if (!orderLineItemSelectionSupportedChannels.has(channelType)) {
                    return ['order_line_item_selection']
                }
            }

            return []
        },
        [
            shopperInputSupportedChannels,
            orderSelectionSupportedChannels,
            shopperAuthenticationSupportedChannels,
            orderLineItemSelectionSupportedChannels,
        ],
    )

    const isStepUnsupportedInAllChannels = useCallback(
        (nodeType: VisualBuilderNode['type']) => {
            if (
                nodeType === 'text_reply' ||
                nodeType === 'file_upload' ||
                nodeType === 'order_selection' ||
                nodeType === 'shopper_authentication' ||
                nodeType === 'order_line_item_selection'
            ) {
                const unsupportedChannels = getUnsupportedChannels(nodeType)
                return allChannels.every((c) => unsupportedChannels.includes(c))
            }
            return false
        },
        [getUnsupportedChannels],
    )

    return useMemo(
        () => ({
            isStepUnsupportedInAllChannels,
            getUnsupportedConnectedChannels,
            getSupportedChannels,
            getUnsupportedChannels,
            getUnsupportedNodeTypes,
        }),
        [
            isStepUnsupportedInAllChannels,
            getUnsupportedConnectedChannels,
            getSupportedChannels,
            getUnsupportedChannels,
            getUnsupportedNodeTypes,
        ],
    )
}

export function createWorkflowChannelSupportContextForPreview(): WorkflowChannelSupportContext {
    return {
        isStepUnsupportedInAllChannels: () => false,
        getUnsupportedConnectedChannels: () => [],
        getSupportedChannels: () => [],
        getUnsupportedChannels: () => [],
        getUnsupportedNodeTypes: () => [],
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
