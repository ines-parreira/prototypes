import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position, useNodeId} from 'reactflow'

import {toPercentage} from 'pages/automate/automate-metrics/utils'
import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'

import useWorkflowDropoffMetricTiers from 'pages/automate/workflows/hooks/useWorkflowDropoffMetricTiers'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {getDropoffColor} from 'pages/automate/workflows/utils/getDropOffColor'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import EdgeBlock from '../components/EdgeBlock'

import {
    displayMetric,
    displayPercentMetric,
    extractUniqueRates,
    getViewerLabel,
    isValidNumber,
    shouldDisplayTooltip,
} from '../utils'
import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    action: EndNodeType['data']['action']
    nodeId: string
}

const EndNode = memo(function EndNode({action, nodeId, edgeProps}: Props) {
    const {workflowStepMetrics} = useWorkflowEditorContext()
    const metricByNodeId = workflowStepMetrics && workflowStepMetrics[nodeId]
    const dropOffRates = extractUniqueRates(workflowStepMetrics ?? {})
    const metricTiers = useWorkflowDropoffMetricTiers({dropOffRates})
    const dropOffTierByNodeId = getDropoffColor(
        metricByNodeId?.dropoffRate ?? 0,
        metricTiers
    )

    const shouldDisplayZero = isValidNumber(metricByNodeId?.views)

    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div className={classNames(css.node, css.endNode)}>
                <div className={css.endNodeHeader}>
                    <div>
                        <Badge type={ColorType.Light}>end flow</Badge>
                    </div>
                    <div className={css.endNodeTitle}>
                        <div>
                            <span className={css.iconContainer}>
                                <i className={classNames('material-icons')}>
                                    {endNodeActionIconByAction[action]}
                                </i>
                            </span>
                            {endNodeActionLabelByAction[action]}
                        </div>
                    </div>
                </div>
                <div className={css.nodeDelimiter} />
                <div className={css.nodeMetrics}>
                    <div
                        className={css.nodeMetric}
                        id={`end-node-${nodeId}-metric-automated`}
                    >
                        <span className={css.metricLabel}>Automated</span>
                        <span className={css.metricValue}>
                            {displayMetric(
                                metricByNodeId?.automatedInteractions,
                                shouldDisplayZero
                            )}
                        </span>
                    </div>
                    {action !== 'end' && (
                        <div
                            className={css.nodeMetric}
                            id={`end-node-${nodeId}-metric-dropoff`}
                        >
                            <span className={css.metricLabel}>Drop off</span>
                            <span
                                className={css.metricValue}
                                style={{
                                    color: dropOffTierByNodeId?.color,
                                    backgroundColor:
                                        dropOffTierByNodeId?.background,
                                }}
                            >
                                {displayPercentMetric(
                                    metricByNodeId?.dropoffRate,
                                    shouldDisplayZero
                                )}
                            </span>
                        </div>
                    )}
                    <div
                        className={css.nodeMetric}
                        id={`end-node-${nodeId}-metric-ticket`}
                    >
                        <span className={css.metricLabel}>Tickets</span>
                        <span className={css.metricValue}>
                            {displayMetric(
                                metricByNodeId?.ticketsCreated,
                                shouldDisplayZero
                            )}
                        </span>
                    </div>
                    {shouldDisplayTooltip(
                        metricByNodeId?.automatedInteractionsRate,
                        shouldDisplayZero
                    ) && (
                        <Tooltip
                            target={`end-node-${nodeId}-metric-automated`}
                            placement="bottom"
                        >
                            {toPercentage(
                                metricByNodeId?.automatedInteractionsRate ?? 0
                            )}
                            <br />
                            <br />
                            Finished flow and did not <br /> contact Support
                            within 72h
                        </Tooltip>
                    )}

                    {action !== 'end' &&
                        shouldDisplayTooltip(
                            metricByNodeId?.dropoff,
                            shouldDisplayZero
                        ) && (
                            <Tooltip
                                target={`end-node-${nodeId}-metric-dropoff`}
                                placement="bottom"
                            >
                                {getViewerLabel(metricByNodeId?.dropoff ?? 0)}
                                <br />
                                <br />
                                Requested Support but left <br /> before a
                                ticket was created
                            </Tooltip>
                        )}

                    {shouldDisplayTooltip(
                        metricByNodeId?.ticketsCreatedRate,
                        shouldDisplayZero
                    ) && (
                        <Tooltip
                            target={`end-node-${nodeId}-metric-ticket`}
                            placement="bottom"
                        >
                            {toPercentage(
                                metricByNodeId?.ticketsCreatedRate ?? 0
                            )}
                            <br />
                            <br />
                            Helped by an agent <br /> (ticket created)
                        </Tooltip>
                    )}
                </div>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={classNames(css.sourceHandle)}
                />
            </div>
        </div>
    )
})

export default function EndNodeWrapper(node: NodeProps<EndNodeType['data']>) {
    const commonProps = useVisualBuilderNodeProps(node)
    const nodeId = useNodeId()

    return (
        <EndNode
            {...commonProps}
            action={node.data.action}
            nodeId={nodeId ?? ''}
        />
    )
}
