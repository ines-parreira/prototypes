import React, { useCallback, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import { isEqual, keyBy, startCase } from 'lodash'
import { Link } from 'react-router-dom'

import {
    LegacyButton as Button,
    Label,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import { getLanguagesFromChatConfig } from 'config/integrations/gorgias_chat'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { ChannelLanguage } from 'pages/automate/common/types'
import useLanguagesMismatchWarnings from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import Search from 'pages/common/components/Search'
import type { Components } from 'rest_api/workflows_api/client.generated'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { FlowSettingsDropdownItem } from './FlowSettingsDropdownItem'
import { FlowSettingsItem } from './FlowSettingsItem'

import css from './FlowsSettings.less'

const FLOWS_LIMIT = 6
const getChannelLanguages = (
    channel: SelfServiceChannel,
): ChannelLanguage[] => {
    switch (channel.type) {
        case TicketChannel.Chat:
            return getLanguagesFromChatConfig(
                channel.value.meta,
            ) as ChannelLanguage[]
        case TicketChannel.HelpCenter:
            return channel.value.supported_locales
        case TicketChannel.ContactForm:
            return [channel.value.default_locale]
    }
    return []
}

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
    channel: SelfServiceChannel
    channelType: string
    onChange?: (
        updatedWorkflows: Workflow[],
        action: 'add' | 'remove' | 'reorder',
    ) => void
}
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
}: Props) => {
    const [dirtyEntrypoints, setDirtyEntrypoints] = useState<Workflow[]>([])
    const dropdownTargetRef = useRef<HTMLButtonElement>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const isAutomateSettings = useIsAutomateSettings()
    const [isFlowSelectorDropdownOpen, setIsFlowSelectorDropdownOpen] =
        useState(false)
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
                selfServiceConfigurationEntrypoints.has(entrypoint.workflow_id),
            )
            .concat(missingEntrypoints)
            .filter((entrypoint) => configurationsMap[entrypoint.workflow_id])
    }, [automationSettingsWorkflows, workflowEntrypoints, configurationsMap])

    const enabledWorkflows = workflows.filter((workflow) => workflow.enabled)

    const { data: entrypointLabelByWorkflowId } = useListWorkflowEntryPoints({
        ids: workflows.map((w) => w.workflow_id),
        language: primaryLanguage,
    })

    const { getLanguagesMismatchWarning } = useLanguagesMismatchWarnings(
        channel.type,
        channel.value.id,
        getChannelLanguages(channel),
    )

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
        [dirtyEntrypoints, enabledWorkflows],
    )

    const handleFlowItemDrop = useCallback(() => {
        if (dirtyEntrypoints.length === 0) return
        if (!isEqual(dirtyEntrypoints, enabledWorkflows)) {
            onChange?.(dirtyEntrypoints, 'reorder')
            setDirtyEntrypoints([])
        }
    }, [dirtyEntrypoints, enabledWorkflows, onChange])

    const workflowsFilteredBySearch = useMemo(() => {
        if (!workflowEntrypoints) return []
        const items = workflows
            .filter((w) => !w.enabled)
            .filter((item) => {
                const warningOrError = getLanguagesMismatchWarning(
                    item.workflow_id,
                )

                return warningOrError && warningOrError.type === 'error'
                    ? false
                    : true
            })
            .map((w) => configurationsMap[w.workflow_id])

        if (searchQuery === '') return items

        return items.filter(
            (item) =>
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entrypointLabelByWorkflowId?.[item.id]
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        )
    }, [
        workflows,
        getLanguagesMismatchWarning,
        configurationsMap,
        searchQuery,
        workflowEntrypoints,
        entrypointLabelByWorkflowId,
    ])

    const currentFlowsCount = enabledWorkflows.length
    const items =
        dirtyEntrypoints.length > 0 ? dirtyEntrypoints : enabledWorkflows

    const flowLink = useMemo(() => {
        if (isAutomateSettings) {
            return `/app/settings/flows/${shopType}/${shopName}`
        }
        return `/app/automation/${shopType}/${shopName}/flows`
    }, [isAutomateSettings, shopName, shopType])

    function editFlowLink(workflowId: string) {
        if (isAutomateSettings) {
            return `/app/settings/flows/${shopType}/${shopName}/edit/${workflowId}`
        }
        return `/app/automation/${shopType}/${shopName}/flows/edit/${workflowId}`
    }

    return (
        <div className="full-width">
            <div className={css.automationDescription}>
                <span>
                    Flows and Order Management are additional automation
                    features included with AI Agent subscription.{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/articles/automations-279714"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </span>
            </div>

            <div className={css.labelWrapper}>
                <Label className={css.label}>Flows</Label>

                <Link to={flowLink} target="_blank" rel="noreferrer">
                    <i className={classnames('material-icons', css.icon)}>
                        open_in_new
                    </i>
                </Link>
            </div>
            <span>
                {`Display up to ${FLOWS_LIMIT} Flows on your
                ${startCase(channelType.replace('-', ' '))} to proactively
                resolve top customer requests.`}
            </span>

            <ul className={css.enabledWorkflowList}>
                {items.map((workflow, index) => {
                    const languagesMismatchWarning =
                        getLanguagesMismatchWarning(workflow.workflow_id)

                    return (
                        <FlowSettingsItem
                            channelType={channelType}
                            index={index}
                            label={configurationsMap[workflow.workflow_id].name}
                            triggerName={
                                entrypointLabelByWorkflowId?.[
                                    workflow.workflow_id
                                ]
                            }
                            languagesMismatchWarning={
                                languagesMismatchWarning &&
                                languagesMismatchWarning.type === 'warning'
                                    ? languagesMismatchWarning.message
                                    : undefined
                            }
                            onMove={handleFlowItemMove}
                            onDrop={handleFlowItemDrop}
                            onCancel={() => setDirtyEntrypoints([])}
                            key={workflow.workflow_id}
                            id={workflow.workflow_id}
                            url={editFlowLink(workflow.workflow_id)}
                            onDelete={() =>
                                onChange?.(
                                    enabledWorkflows.filter(
                                        (w) =>
                                            w.workflow_id !==
                                            workflow.workflow_id,
                                    ),
                                    'remove',
                                )
                            }
                        />
                    )
                })}
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
                    {
                        'You’ve reached the maximum number of Flows to display on this channel.'
                    }
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
                                onChange?.(
                                    [
                                        ...enabledWorkflows,
                                        {
                                            workflow_id: configuration.id,
                                            enabled: true,
                                        },
                                    ],
                                    'add',
                                )
                            }}
                        />
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
