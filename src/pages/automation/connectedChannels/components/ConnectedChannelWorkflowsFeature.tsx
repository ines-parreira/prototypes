import React, {ReactNode, useMemo, useRef, useState} from 'react'
import _keyBy from 'lodash/keyBy'
import _isEqual from 'lodash/isEqual'
import {Link} from 'react-router-dom'

import Label from 'pages/common/forms/Label/Label'
import Button from 'pages/common/components/button/Button'
import {useWorkflowChannelSupportContext} from 'pages/automation/workflows/hooks/useWorkflowChannelSupport'
import {SelfServiceChannelType} from 'pages/automation/common/hooks/useSelfServiceChannels'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import WorkflowItem from './WorkflowItem'

import css from './ConnectedChannelWorkflowsFeature.less'

type Entrypoint = {
    workflow_id: string
    enabled: boolean
}

type Props = {
    channelType: SelfServiceChannelType
    channelId: string
    entrypoints: Entrypoint[]
    limitTooltipMessage: ReactNode
    maxActiveWorkflows: number
    onChange: (nextEntrypoints: Entrypoint[]) => void
}

const ConnectedChannelWorkflowsFeature = ({
    channelType,
    channelId,
    entrypoints: entrypointsProp,
    onChange,
    maxActiveWorkflows,
    limitTooltipMessage,
}: Props) => {
    const {
        workflowConfigurations: configurations,
        workflowsEntrypoints: allEntrypoints,
        workflowsUrl,
    } = useConnectedChannelsViewContext()
    const {getUnsupportedStepsNames} = useWorkflowChannelSupportContext()

    const configurationsById = useMemo(
        () => _keyBy(configurations, 'id'),
        [configurations]
    )
    const entrypoints = useMemo(() => {
        const entrypointsByWorkflowId = _keyBy(entrypointsProp, 'workflow_id')
        const allEntrypointsByWorkflowId = _keyBy(allEntrypoints, 'workflow_id')
        const missingEntrypoints = allEntrypoints
            .filter(
                (entrypoint) =>
                    !(entrypoint.workflow_id in entrypointsByWorkflowId)
            )
            .map((entrypoint) => ({
                workflow_id: entrypoint.workflow_id,
                enabled: false,
            }))

        return entrypointsProp
            .filter(
                (entrypoint) =>
                    entrypoint.workflow_id in allEntrypointsByWorkflowId
            )
            .concat(missingEntrypoints)
    }, [entrypointsProp, allEntrypoints])
    const enabledEntrypointsCount = useMemo(
        () => entrypoints.filter((entrypoint) => entrypoint.enabled).length,
        [entrypoints]
    )

    const previousEntrypoints = useRef(entrypoints)
    const [dirtyEntrypoints, setDirtyEntrypoints] = useState(entrypoints)

    if (previousEntrypoints.current !== entrypoints) {
        previousEntrypoints.current = entrypoints

        setDirtyEntrypoints(entrypoints)
    }

    const handleMove = (dragIndex: number, hoverIndex: number) => {
        const nextDirtyEntrypoints = [...dirtyEntrypoints]
        const dirtyEntrypoint = nextDirtyEntrypoints[dragIndex]

        if (!dirtyEntrypoint) {
            return
        }

        nextDirtyEntrypoints.splice(dragIndex, 1)
        nextDirtyEntrypoints.splice(hoverIndex, 0, dirtyEntrypoint)

        setDirtyEntrypoints(nextDirtyEntrypoints)
    }
    const handleDrop = () => {
        if (!_isEqual(dirtyEntrypoints, entrypoints)) {
            onChange(dirtyEntrypoints)
        }
    }
    const handleCancel = () => {
        setDirtyEntrypoints(entrypoints)
    }
    const handleToggle = (index: number, isEnabled: boolean) => {
        const nextEntrypoints = [...dirtyEntrypoints]
        nextEntrypoints[index] = {...nextEntrypoints[index], enabled: isEnabled}
        onChange(nextEntrypoints)
    }

    const isLimitReached = enabledEntrypointsCount >= maxActiveWorkflows

    return (
        <div className={css.container}>
            <div className={css.label}>
                <Label>Flows</Label>
                {!dirtyEntrypoints.length && (
                    <Link to={workflowsUrl}>
                        <Button size="small">Add Flows</Button>
                    </Link>
                )}
            </div>
            {dirtyEntrypoints.map((entrypoint, index) => {
                const unsupportedStepsNames = getUnsupportedStepsNames(
                    channelType,
                    configurationsById[entrypoint.workflow_id]
                )
                const tooltipMessage =
                    unsupportedStepsNames.length > 0
                        ? `This flow contains steps that this channel doesn't support: ${unsupportedStepsNames.join(
                              ', '
                          )}`
                        : limitTooltipMessage
                return (
                    <WorkflowItem
                        key={entrypoint.workflow_id}
                        dndType={`workflows-${channelId}`}
                        onMove={handleMove}
                        onDrop={handleDrop}
                        onCancel={handleCancel}
                        name={configurationsById[entrypoint.workflow_id].name}
                        isEnabled={entrypoint.enabled}
                        isToggleable={
                            entrypoint.enabled ||
                            (!isLimitReached &&
                                !(unsupportedStepsNames.length > 0))
                        }
                        index={index}
                        onToggle={handleToggle}
                        tooltipMessage={tooltipMessage}
                    />
                )
            })}
        </div>
    )
}

export default ConnectedChannelWorkflowsFeature
