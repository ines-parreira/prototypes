import { Icon } from '@gorgias/axiom'

import type { NodeProps } from 'core/ui/flows'
import { ActionLabel, NodeWrapper } from 'core/ui/flows'

import type { EndCallNode } from '../types'

export function EndCallNode(props: NodeProps<EndCallNode>) {
    return (
        <NodeWrapper {...props}>
            <ActionLabel
                label="End Call"
                icon={<Icon name="comm-phone-end" />}
            />
        </NodeWrapper>
    )
}
