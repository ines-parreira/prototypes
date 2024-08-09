import React, {useCallback, useMemo, useRef, useState} from 'react'
import {Label, Tooltip} from '@gorgias/ui-kit'
import {isEqual, keyBy, startCase} from 'lodash'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {Components} from 'rest_api/workflows_api/client.generated'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Search from 'pages/common/components/Search'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import {useListWorkflowEntryPoints} from 'models/workflows/queries'
import {FeatureFlagKey} from 'config/featureFlags'
import css from './FlowsSettings.less'
import {FlowSettingsDropdownItem} from './FlowSettingsDropdownItem'
import {FlowSettingsItem} from './FlowSettingsItem'

const FLOWS_LIMIT = 6
type Workflow = {
    workflow_id: string
    enabled: boolean
}
interface Props {
    workflowEntrypoints: SelfServiceConfiguration['workflowsEntrypoints']
    configurations: Components.Schemas.ListWfConfigurationsResponseDto
    automationSettingsWorkflows: Workflow[]
    primaryLanguage: string
    shopName: string
    shopType: string
    channelType: string
    enabledQuickResponses?: number
    onChange?: (updatedWorkflows: Workflow[]) => void
}
export const FlowsSettings = ({
    workflowEntrypoints,
    configurations,
    automationSettingsWorkflows,
    primaryLanguage,
    shopName,
    shopType,
    channelType,
    enabledQuickResponses = 0,
    onChange,
}: Props) => {
    const [dirtyEntrypoints, setDirtyEntrypoints] = useState<Workflow[]>([])
    const dropdownTargetRef = useRef<HTMLButtonElement>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isFlowSelectorDropdownOpen, setIsFlowSelectorDropdownOpen] =
        useState(false)
    const configurationsMap = useMemo(
        () => keyBy(configurations, 'id'),
        [configurations]
    )

    const workflows = useMemo(() => {
        if (!workflowEntrypoints) return []

        const channelEntrypoints = new Map(
            automationSettingsWorkflows.map((e) => [e.workflow_id, e])
        )

        const selfServiceConfigurationEntrypoints = new Map(
            workflowEntrypoints?.map((e) => [e.workflow_id, e])
        )

        const missingEntrypoints = []
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
                selfServiceConfigurationEntrypoints.has(entrypoint.workflow_id)
            )
            .concat(missingEntrypoints)
            .filter((entrypoint) => configurationsMap[entrypoint.workflow_id])
    }, [automationSettingsWorkflows, workflowEntrypoints, configurationsMap])

    const enabledWorkflows = workflows.filter((workflow) => workflow.enabled)

    const {data: entrypointLabelByWorkflowId} = useListWorkflowEntryPoints({
        ids: workflows.map((w) => w.workflow_id),
        language: primaryLanguage,
    })

    const handleFlowItemMove = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            const nextDirtyEntrypoints =
                dirtyEntrypoints.length > 0
                    ? [...dirtyEntrypoints]
                    : enabledWorkflows.slice()
            const dirtyEntrypoint = nextDirtyEntrypoints[dragIndex]

            if (!dirtyEntrypoint) {
                return
            }

            nextDirtyEntrypoints.splice(dragIndex, 1)
            nextDirtyEntrypoints.splice(hoverIndex, 0, dirtyEntrypoint)

            setDirtyEntrypoints(nextDirtyEntrypoints)
        },
        [dirtyEntrypoints, enabledWorkflows]
    )

    const handleFlowItemDrop = useCallback(() => {
        if (dirtyEntrypoints.length === 0) return
        if (!isEqual(dirtyEntrypoints, enabledWorkflows)) {
            onChange?.(dirtyEntrypoints)
            setDirtyEntrypoints([])
        }
    }, [dirtyEntrypoints, enabledWorkflows, onChange])

    const workflowsFilteredBySearch = useMemo(() => {
        if (!workflowEntrypoints) return []
        const items = workflows
            .filter((w) => !w.enabled)
            .map((w) => configurationsMap[w.workflow_id])

        if (searchQuery === '') return items

        return items.filter(
            (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entrypointLabelByWorkflowId?.[item.id]
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        )
    }, [
        workflows,
        configurationsMap,
        searchQuery,
        workflowEntrypoints,
        entrypointLabelByWorkflowId,
    ])
    const sunsetQuickResponses = useFlags()[FeatureFlagKey.SunsetQuickResponses]
    const currentFlowsCount = enabledWorkflows.length + enabledQuickResponses

    return (
        <div className="full-width">
            <Label>Flows</Label>
            <span>
                {sunsetQuickResponses
                    ? `Display up to ${FLOWS_LIMIT} Flows on your Chat to proactively resolve top customer requests.`
                    : `Display up to ${FLOWS_LIMIT} Flows or Quick Responses on your
                ${startCase(channelType.replace('-', ' '))} to proactively
                resolve top customer requests.`}
            </span>

            <ul className={css.enabledWorkflowList}>
                {enabledWorkflows.map((workflow, index) => (
                    <FlowSettingsItem
                        channelType={channelType}
                        index={index}
                        label={configurationsMap[workflow.workflow_id].name}
                        triggerName={
                            entrypointLabelByWorkflowId?.[workflow.workflow_id]
                        }
                        onMove={handleFlowItemMove}
                        onDrop={handleFlowItemDrop}
                        onCancel={() => setDirtyEntrypoints([])}
                        key={workflow.workflow_id}
                        id={workflow.workflow_id}
                        url={`/app/automation/${shopType}/${shopName}/flows/edit/${workflow.workflow_id}`}
                        onDelete={() =>
                            onChange?.(
                                enabledWorkflows.filter(
                                    (w) =>
                                        w.workflow_id !== workflow.workflow_id
                                )
                            )
                        }
                    />
                ))}
            </ul>

            <Button
                id="add-flow-button"
                intent="secondary"
                isDisabled={currentFlowsCount >= FLOWS_LIMIT}
                ref={dropdownTargetRef}
                onClick={() => setIsFlowSelectorDropdownOpen((prev) => !prev)}
            >
                Add Flow{' '}
                <i className={classnames('material-icons', css.buttonIcon)}>
                    arrow_drop_down
                </i>
            </Button>
            {currentFlowsCount >= FLOWS_LIMIT && (
                <Tooltip
                    trigger={['hover']}
                    placement="top"
                    target="add-flow-button"
                >
                    {sunsetQuickResponses
                        ? 'You’ve reached the maximum number of Flows to display on this channel.'
                        : 'You’ve reached the maximum number of Quick Responses and Flows to display on this channel.'}
                </Tooltip>
            )}
            <Dropdown
                target={dropdownTargetRef}
                isOpen={isFlowSelectorDropdownOpen}
                onToggle={setIsFlowSelectorDropdownOpen}
                className={css.flowsDropdown}
                placement="bottom-start"
            >
                <DropdownHeader className={css.flowsDropdownHeader}>
                    <Search
                        id="flows-search"
                        placeholder="Search Flows"
                        onChange={(query) => setSearchQuery(query)}
                    />
                </DropdownHeader>
                <DropdownBody>
                    {workflowsFilteredBySearch.map((configuration) => (
                        <FlowSettingsDropdownItem
                            label={configuration.name}
                            value={configuration.id}
                            key={configuration.id}
                            triggerName={
                                entrypointLabelByWorkflowId?.[configuration.id]
                            }
                            onEnable={() => {
                                setIsFlowSelectorDropdownOpen(false)
                                onChange?.([
                                    ...enabledWorkflows,
                                    {
                                        workflow_id: configuration.id,
                                        enabled: true,
                                    },
                                ])
                            }}
                        />
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
