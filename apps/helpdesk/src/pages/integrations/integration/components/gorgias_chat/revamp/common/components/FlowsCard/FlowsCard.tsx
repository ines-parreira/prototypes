import { Box, Card, Elevation, Heading, Skeleton, Text } from '@gorgias/axiom'

import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { Components } from 'rest_api/workflows_api/client.generated'

import { FlowsSettings } from './FlowsSettings'
import type { Workflow } from './types'

import css from './FlowsCard.less'

type FlowsCardProps = {
    isLoading?: boolean
    shopName: string
    shopType: string
    channel: SelfServiceChatChannel
    primaryLanguage: string
    workflowEntrypoints: SelfServiceConfiguration['workflowsEntrypoints']
    workflowConfigurations: Components.Schemas.ListWfConfigurationsResponseDto
    automationSettingsWorkflows: Workflow[]
    onAdd: (updatedWorkflows: Workflow[]) => void
    onRemove: (updatedWorkflows: Workflow[]) => void
    onReorder: (updatedWorkflows: Workflow[]) => void
    onFocus?: () => void
}

export function FlowsCard({
    isLoading = false,
    shopName,
    shopType,
    channel,
    primaryLanguage,
    workflowEntrypoints,
    workflowConfigurations,
    automationSettingsWorkflows,
    onAdd,
    onRemove,
    onReorder,
    onFocus,
}: FlowsCardProps) {
    if (isLoading) {
        return <Skeleton height={200} />
    }

    return (
        <Card elevation={Elevation.Mid} p="md" className={css.card}>
            <Box flexDirection="column" gap="md">
                <Box flexDirection="column" gap="xxxs">
                    <Heading size="md">Flows</Heading>
                    <Text size="md" color="content-neutral-secondary">
                        Show up to 6 flows on your chat to proactively resolve
                        top shopper requests.
                    </Text>
                </Box>
                <FlowsSettings
                    channelType="chat"
                    channel={channel}
                    shopType={shopType}
                    shopName={shopName}
                    workflowEntrypoints={workflowEntrypoints}
                    primaryLanguage={primaryLanguage}
                    configurations={workflowConfigurations}
                    automationSettingsWorkflows={automationSettingsWorkflows}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onReorder={onReorder}
                    onFocus={onFocus}
                />
            </Box>
        </Card>
    )
}
