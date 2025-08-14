import { Icon } from '@gorgias/axiom'

import { ActionLabel, NodeWrapper } from 'core/ui/flows'

export function EndCallNode() {
    return (
        <NodeWrapper>
            <ActionLabel
                label="End Call"
                icon={<Icon name="comm-phone-end" />}
            />
        </NodeWrapper>
    )
}
