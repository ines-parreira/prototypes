import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position, useNodeId} from 'reactflow'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'

import Tooltip from 'pages/common/components/Tooltip'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {toPercentage} from 'pages/automate/automate-metrics/utils'
import useWorkflowDropoffMetricTiers from 'pages/automate/workflows/hooks/useWorkflowDropoffMetricTiers'
import {getDropoffColor} from 'pages/automate/workflows/utils/getDropOffColor'
import EdgeBlock from '../components/EdgeBlock'

import {displayMetric, extractUniqueRates, isValidNumber} from '../utils'
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
                                metricByNodeId?.automatedInteractions
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
                                {isValidNumber(metricByNodeId?.dropoffRate)
                                    ? toPercentage(
                                          metricByNodeId?.dropoffRate ?? 0
                                      )
                                    : '-'}
                            </span>
                        </div>
                    )}
                    <div
                        className={css.nodeMetric}
                        id={`end-node-${nodeId}-metric-ticket`}
                    >
                        <span className={css.metricLabel}>Ticket</span>
                        <span className={css.metricValue}>
                            {displayMetric(metricByNodeId?.ticketsCreated)}
                        </span>
                    </div>
                    {isValidNumber(
                        metricByNodeId?.automatedInteractionsRate
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
                            within 72
                        </Tooltip>
                    )}

                    {action !== 'end' &&
                        isValidNumber(metricByNodeId?.dropoff) && (
                            <Tooltip
                                target={`end-node-${nodeId}-metric-dropoff`}
                                placement="bottom"
                            >
                                {metricByNodeId?.dropoff} viewers
                                <br />
                                <br />
                                Requested Support but left <br /> before a
                                ticket was created
                            </Tooltip>
                        )}

                    {isValidNumber(metricByNodeId?.ticketsCreatedRate) && (
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
