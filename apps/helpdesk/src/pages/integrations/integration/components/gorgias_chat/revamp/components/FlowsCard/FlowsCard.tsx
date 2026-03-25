import { Box, Card, Elevation, Heading, Skeleton, Text } from '@gorgias/axiom'

import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { Components } from 'rest_api/workflows_api/client.generated'

import { FlowsSettings } from './FlowsSettings'

import css from './FlowsCard.less'

type Workflow = {
    workflow_id: string
    enabled: boolean
}

type FlowsCardProps = {
    isLoading?: boolean
    shopName: string
    shopType: string
    channel: SelfServiceChatChannel
    primaryLanguage: string
    workflowEntrypoints: SelfServiceConfiguration['workflowsEntrypoints']
    workflowConfigurations: Components.Schemas.ListWfConfigurationsResponseDto
    automationSettingsWorkflows: Workflow[]
    onChange: (
        updatedWorkflows: Workflow[],
        action: 'add' | 'remove' | 'reorder',
    ) => void
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
    onChange,
    onFocus,
}: FlowsCardProps) {
    if (isLoading) {
        return <Skeleton height={200} />
    }

    return (
        <Card elevation={Elevation.Mid} p="md" className={css.card}>
            <Box flexDirection="column" gap="md">
                <Box flexDirection="column" gap="xs">
                    <Heading size="md">Flows</Heading>
                    <Text size="md" color="var(--content-neutral-secondary)">
                        Show up to 6 flows on your chat to proactively resolve
                        top customer requests.
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
                    onChange={onChange}
                    onFocus={onFocus}
                />
            </Box>
        </Card>
    )
}
