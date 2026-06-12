import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Box, Button, Menu, MenuItem } from '@gorgias/axiom'
import { keyBy } from '@gorgias/toolkit'

import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import { useLanguagesMismatchWarnings } from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import type { Components } from 'rest_api/workflows_api/client.generated'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { FlowsList } from './FlowsList'
import type { Workflow } from './types'
import { FLOWS_LIMIT } from './types'
import { getChannelLanguages } from './utils'

type FlowsSettingsProps = {
    workflowEntrypoints: SelfServiceConfiguration['workflowsEntrypoints']
    configurations: Components.Schemas.ListWfConfigurationsResponseDto
    automationSettingsWorkflows: Workflow[]
    primaryLanguage: string
    shopName: string
    shopType: string
    channel: SelfServiceChannel
    channelType: string
    onAdd?: (updatedWorkflows: Workflow[]) => void
    onRemove?: (updatedWorkflows: Workflow[]) => void
    onReorder?: (updatedWorkflows: Workflow[]) => void
    onFocus?: () => void
}

export const FlowsSettings = ({
    workflowEntrypoints,
    configurations,
    automationSettingsWorkflows,
    shopName,
    shopType,
    channelType,
    channel,
    onAdd,
    onRemove,
    onReorder,
    onFocus,
}: FlowsSettingsProps) => {
    const isAutomateSettings = useIsAutomateSettings()

    const configurationsMap = useMemo(
        () => keyBy(configurations, 'id'),
        [configurations],
    )

    const workflows = useMemo(() => {
        if (!workflowEntrypoints) return []

        const channelEntrypoints = new Map(
            automationSettingsWorkflows.map((e) => [e.workflow_id, e]),
        )

        const selfServiceConfigurationEntrypoints = new Map(
            workflowEntrypoints?.map((e) => [e.workflow_id, e]),
        )

        const missingEntrypoints: Workflow[] = []
        for (const entrypoint of workflowEntrypoints) {
            if (!channelEntrypoints.has(entrypoint.workflow_id)) {
                missingEntrypoints.push({
                    workflow_id: entrypoint.workflow_id,
                    enabled: false,
                })
            }
        }

        return automationSettingsWorkflows
            .filter((entrypoint) =>
                selfServiceConfigurationEntrypoints.has(entrypoint.workflow_id),
            )
            .concat(missingEntrypoints)
            .filter((entrypoint) => configurationsMap[entrypoint.workflow_id])
    }, [automationSettingsWorkflows, workflowEntrypoints, configurationsMap])

    const enabledWorkflows = workflows.filter((workflow) => workflow.enabled)

    const { getLanguagesMismatchWarning } = useLanguagesMismatchWarnings(
        channel.type,
        channel.value.id,
        getChannelLanguages(channel),
    )

    const availableWorkflows = useMemo(() => {
        if (!workflowEntrypoints) return []
        return workflows
            .filter((w) => !w.enabled)
            .filter((item) => {
                const warningOrError = getLanguagesMismatchWarning(
                    item.workflow_id,
                )
                return !(warningOrError && warningOrError.type === 'error')
            })
            .map((w) => configurationsMap[w.workflow_id])
    }, [
        workflows,
        getLanguagesMismatchWarning,
        configurationsMap,
        workflowEntrypoints,
    ])

    const currentFlowsCount = enabledWorkflows.length
    const isAddDisabled =
        currentFlowsCount >= FLOWS_LIMIT || availableWorkflows.length === 0

    const getEditFlowLink = (workflowId: string) => {
        if (isAutomateSettings) {
            return `/app/settings/flows/${shopType}/${shopName}/edit/${workflowId}`
        }
        return `/app/automation/${shopType}/${shopName}/flows/edit/${workflowId}`
    }

    const handleAddFlow = (workflowId: string) => {
        onAdd?.([
            ...enabledWorkflows,
            {
                workflow_id: workflowId,
                enabled: true,
            },
        ])
    }

    const handleRemoveFlow = (workflowId: string) => {
        onRemove?.(enabledWorkflows.filter((w) => w.workflow_id !== workflowId))
    }

    const handleReorderFlows = (reorderedWorkflows: Workflow[]) => {
        onReorder?.(reorderedWorkflows)
    }

    const getLanguagesMismatchWarningMessage = (
        workflowId: string,
    ): ReactNode | undefined => {
        const result = getLanguagesMismatchWarning(workflowId)
        return result?.type === 'warning' ? result.message : undefined
    }

    return (
        <Box flexDirection="column" gap="md" width="100%">
            <FlowsList
                items={enabledWorkflows}
                channelType={channelType}
                configurationsMap={configurationsMap}
                getEditFlowLink={getEditFlowLink}
                getLanguagesMismatchWarning={getLanguagesMismatchWarningMessage}
                onReorder={handleReorderFlows}
                onRemove={handleRemoveFlow}
            />

            <Box>
                <Menu
                    trigger={
                        <Button
                            variant="secondary"
                            trailingSlot="arrow-chevron-down"
                            isDisabled={isAddDisabled}
                            onFocus={onFocus}
                        >
                            Add flow
                        </Button>
                    }
                    aria-label="Add flow"
                    placement="bottom left"
                    maxHeight={200}
                    shouldFlip={false}
                    minWidth={200}
                    size="md"
                    items={availableWorkflows}
                    onAction={(key) => handleAddFlow(key as string)}
                >
                    {(configuration) => (
                        <MenuItem
                            id={configuration.id}
                            label={configuration.name}
                        />
                    )}
                </Menu>
            </Box>
        </Box>
    )
}
