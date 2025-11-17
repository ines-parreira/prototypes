import { Icon } from '@gorgias/axiom'

import type { NodeProps } from 'core/ui/flows'
import { ActionLabel, NodeWrapper } from 'core/ui/flows'

import type { IncomingCallNode } from '../types'

export function IncomingCallNode(props: NodeProps<IncomingCallNode>) {
    return (
        <NodeWrapper {...props}>
            <ActionLabel
                label="Incoming Call"
                icon={<Icon name="comm-phone" />}
            />
        </NodeWrapper>
    )
}
