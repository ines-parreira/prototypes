import { Panel } from '@repo/layout'

import { Box } from '@gorgias/axiom'

import { TicketTable } from '../ticket-list'
import { ViewHeader } from './ViewHeader'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

type ViewPanelProps = {
    viewId: number
    onExpand?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
}

export function ViewPanel({ viewId, onExpand, onApplyMacro }: ViewPanelProps) {
    return (
        <Panel name="views" config={panelConfig}>
            <Box height="100%" width="100%" flexDirection="column">
                <ViewHeader viewId={viewId} onExpand={onExpand} />
                <TicketTable viewId={viewId} onApplyMacro={onApplyMacro} />
            </Box>
        </Panel>
    )
}
