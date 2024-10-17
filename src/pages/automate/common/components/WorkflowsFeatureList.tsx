import React, {ReactNode, useMemo, useRef, useState} from 'react'
import _keyBy from 'lodash/keyBy'
import _isEqual from 'lodash/isEqual'
import _uniq from 'lodash/uniq'
import {Link} from 'react-router-dom'
import {Label} from '@gorgias/ui-kit'

import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import {FeatureFlagKey} from 'config/featureFlags'
import {TicketChannel} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {ListWfConfigurationsResponseDto} from 'pages/automate/workflows/types'
import {
    getChannelName,
    useWorkflowChannelSupportContext,
} from '../../workflows/hooks/useWorkflowChannelSupport'
import {SelfServiceChannelType} from '../hooks/useSelfServiceChannels'
import useLanguagesMismatchWarnings from '../../workflows/hooks/useLanguagesMismatchWarnings'
import {ChannelLanguage} from '../types'

import WorkflowItem from './WorkflowItem'

import css from './WorkflowsFeatureList.less'

export type Entrypoint = {
    workflow_id: string
    enabled: boolean
}

type Props = {
    channelType: SelfServiceChannelType
    channelId: string
    integrationId: number
    channelLanguages: ChannelLanguage[]
    entrypoints: Entrypoint[]
    limitTooltipMessage: ReactNode
    maxActiveWorkflows: number
    onChange: (nextEntrypoints: Entrypoint[]) => void
    workflowsUrl?: string
    configurations: ListWfConfigurationsResponseDto
    allEntrypoints: {workflow_id: string}[]
    withLabel?: boolean
    itemLimit?: number
}

/* This component required `WorkflowChannelSupportContext` */
const WorkflowsFeatureList = ({
    channelType,
    channelId,
    integrationId,
    channelLanguages,
    entrypoints: entrypointsProp,
    onChange,
    maxActiveWorkflows,
    limitTooltipMessage,
    workflowsUrl,
    configurations,
    allEntrypoints,
    withLabel = true,
    itemLimit,
}: Props) => {
    const {getUnsupportedNodeTypes, getSupportedChannels} =
        useWorkflowChannelSupportContext()

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

        const entrypoints = entrypointsProp
            .filter(
                (entrypoint) =>
                    entrypoint.workflow_id in allEntrypointsByWorkflowId
            )
            .concat(missingEntrypoints)
            .filter(
                (entrypoint) => entrypoint.workflow_id in configurationsById
            )

        return entrypoints.slice(0, itemLimit ?? entrypoints.length)
    }, [entrypointsProp, allEntrypoints, configurationsById, itemLimit])
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
        logEvent(SegmentEvent.AutomateChannelUpdateFromFlows, {
            page: 'Workflows',
        })
        onChange(nextEntrypoints)
    }

    const {getLanguagesMismatchWarning} = useLanguagesMismatchWarnings(
        channelType,
        integrationId,
        channelLanguages
    )

    const isMLFlowRecommendationEnabled =
        useFlags()[FeatureFlagKey.MLFlowsRecommendation]

    const isLimitReached =
        channelType === TicketChannel.Chat && isMLFlowRecommendationEnabled
            ? false
            : enabledEntrypointsCount >= maxActiveWorkflows

    return (
        <div className={css.container}>
            {withLabel && (
                <div className={css.label}>
                    <Label>Flows</Label>
                    {!dirtyEntrypoints.length && workflowsUrl && (
                        <Link to={workflowsUrl}>
                            <Button size="small">Add Flows</Button>
                        </Link>
                    )}
                </div>
            )}
            {dirtyEntrypoints.map((entrypoint, index) => {
                const unsupportedNodeTypes = getUnsupportedNodeTypes(
                    channelType,
                    configurationsById[entrypoint.workflow_id]
                )
                const onlySupportedChannels = _uniq(
                    unsupportedNodeTypes.reduce(
                        (acc, nodeType) => [
                            ...acc,
                            ...getSupportedChannels(nodeType),
                        ],
                        [] as SelfServiceChannelType[]
                    )
                )

                const languagesMismatchWarning = getLanguagesMismatchWarning(
                    entrypoint.workflow_id
                )

                const toggleTooltipMessage =
                    onlySupportedChannels.length > 0
                        ? `This flow contains actions currently only supported in ${onlySupportedChannels
                              .map(getChannelName)
                              .join(' and ')}.`
                        : isLimitReached
                          ? limitTooltipMessage
                          : languagesMismatchWarning?.type === 'error'
                            ? languagesMismatchWarning.message
                            : null
                const warningtooltipMessage =
                    isLimitReached && !entrypoint.enabled
                        ? null
                        : languagesMismatchWarning?.message
                return (
                    <WorkflowItem
                        key={entrypoint.workflow_id}
                        dndType={`workflows-${channelId}`}
                        onMove={handleMove}
                        onDrop={handleDrop}
                        onCancel={handleCancel}
                        name={configurationsById[entrypoint.workflow_id]?.name}
                        isEnabled={entrypoint.enabled}
                        isToggleable={
                            entrypoint.enabled ||
                            (!isLimitReached &&
                                languagesMismatchWarning?.type !== 'error' &&
                                !(onlySupportedChannels.length > 0))
                        }
                        index={index}
                        onToggle={handleToggle}
                        toggleTooltipMessage={toggleTooltipMessage}
                        warningTooltipMessage={warningtooltipMessage}
                    />
                )
            })}
        </div>
    )
}

export default WorkflowsFeatureList
