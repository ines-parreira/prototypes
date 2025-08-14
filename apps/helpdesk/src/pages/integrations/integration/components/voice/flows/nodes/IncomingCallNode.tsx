import { Icon } from '@gorgias/axiom'

import { ActionLabel, NodeWrapper } from 'core/ui/flows'

export function IncomingCallNode() {
    return (
        <NodeWrapper>
            <ActionLabel
                label="Incoming Call"
                icon={<Icon name="comm-phone" />}
            />
        </NodeWrapper>
    )
}
