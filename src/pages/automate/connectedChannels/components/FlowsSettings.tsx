import React, {useMemo, useRef, useState} from 'react'
import {Label} from '@gorgias/ui-kit'
import {keyBy} from 'lodash'
import classnames from 'classnames'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {Components} from 'rest_api/workflows_api/client.generated'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Search from 'pages/common/components/Search'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import {useListWorkflowEntryPoints} from 'models/workflows/queries'
import IconButton from 'pages/common/components/button/IconButton'
import css from './FlowsSettings.less'

const FLOWS_LIMIT = 6

interface Props {
    workflowEntrypoints: SelfServiceConfiguration['workflowsEntrypoints']
    configurations: Components.Schemas.ListWfConfigurationsResponseDto
    automationSettingsWorkflows: {workflow_id: string; enabled: boolean}[]
    primaryLanguage: string
}
export const FlowsSettings = ({
    workflowEntrypoints,
    configurations,
    automationSettingsWorkflows,
    primaryLanguage,
}: Props) => {
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

    return (
        <div className="full-width">
            <Label>Flows</Label>
            <span>
                Display up to {FLOWS_LIMIT} Flows or Quick Responses on your
                Chat to proactively resolve top customer requests.
            </span>

            <ul className={css.enabledWorkflowList}>
                {enabledWorkflows.map((workflow) => (
                    <li
                        key={workflow.workflow_id}
                        className={css.workflowListItem}
                    >
                        <i
                            className={classnames(
                                'material-icons',
                                css.dragIcon
                            )}
                        >
                            drag_indicator
                        </i>

                        <div>
                            <Label>
                                {configurationsMap[workflow.workflow_id].name}
                            </Label>

                            <span className={css.workflowTriggerName}>
                                {
                                    entrypointLabelByWorkflowId?.[
                                        workflow.workflow_id
                                    ]
                                }
                            </span>
                        </div>
                        <div className={css.workflowListItemButtons}>
                            <IconButton fillStyle="ghost" intent="secondary">
                                edit
                            </IconButton>
                            <IconButton fillStyle="ghost" intent="destructive">
                                close
                            </IconButton>
                        </div>
                    </li>
                ))}
            </ul>

            <Button
                intent="secondary"
                ref={dropdownTargetRef}
                onClick={() => setIsFlowSelectorDropdownOpen((prev) => !prev)}
            >
                Add Flow{' '}
                <i className={classnames('material-icons', css.buttonIcon)}>
                    arrow_drop_down
                </i>
            </Button>

            <Dropdown
                target={dropdownTargetRef}
                isOpen={isFlowSelectorDropdownOpen}
                onToggle={setIsFlowSelectorDropdownOpen}
                className={css.flowsDropdown}
                placement="bottom-start"
            >
                <DropdownHeader className={css.flowsDropdownHeader}>
                    <Search
                        placeholder="Search Flows"
                        onChange={(query) => setSearchQuery(query)}
                    />
                </DropdownHeader>
                <DropdownBody>
                    {workflowsFilteredBySearch.map((configuration) => (
                        <DropdownItem
                            option={{
                                label: configuration.name,
                                value: configuration.id,
                            }}
                            key={configuration.id}
                            onClick={() => {
                                setIsFlowSelectorDropdownOpen(false)
                            }}
                            className={css.workflowDropdownItem}
                        >
                            <div>{configuration.name}</div>
                            <span className={css.workflowTriggerName}>
                                {
                                    entrypointLabelByWorkflowId?.[
                                        configuration.id
                                    ]
                                }
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
