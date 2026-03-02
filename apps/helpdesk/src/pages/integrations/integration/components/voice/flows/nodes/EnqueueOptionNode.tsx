import type { NodeProps } from 'core/ui/flows'
import { ActionLabel, NodeWrapper } from 'core/ui/flows'

import type { EnqueueOptionNode } from '../types'

type EnqueueOptionNodeProps = NodeProps<EnqueueOptionNode>

export function EnqueueOptionNode(props: EnqueueOptionNodeProps) {
    const { data } = props

    return (
        <NodeWrapper {...props}>
            <ActionLabel label={data.isSkipStep ? 'Skip queue' : 'Default'} />
        </NodeWrapper>
    )
}
