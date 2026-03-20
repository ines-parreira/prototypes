import { useMemo } from 'react'

import { keyBy } from 'lodash'

import { Box, Button, Menu, MenuItem } from '@gorgias/axiom'

import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import useLanguagesMismatchWarnings from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { FlowsList } from './FlowsList'
import type { FlowsSettingsProps, Workflow } from './types'
import { FLOWS_LIMIT } from './types'
import { getChannelLanguages } from './utils'

export const FlowsSettings = ({
    workflowEntrypoints,
    configurations,
    automationSettingsWorkflows,
    primaryLanguage,
    shopName,
    shopType,
    channelType,
    channel,
    onChange,
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

    useListWorkflowEntryPoints({
        ids: workflows.map((w) => w.workflow_id),
        language: primaryLanguage,
    })

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
        onChange?.(
            [
                ...enabledWorkflows,
                {
                    workflow_id: workflowId,
                    enabled: true,
                },
            ],
            'add',
        )
    }

    const handleRemoveFlow = (workflowId: string) => {
        onChange?.(
            enabledWorkflows.filter((w) => w.workflow_id !== workflowId),
            'remove',
        )
    }

    const handleReorderFlows = (reorderedWorkflows: Workflow[]) => {
        onChange?.(reorderedWorkflows, 'reorder')
    }

    return (
        <Box flexDirection="column" gap="md" width="100%">
            <FlowsList
                items={enabledWorkflows}
                channelType={channelType}
                configurationsMap={configurationsMap}
                getEditFlowLink={getEditFlowLink}
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
