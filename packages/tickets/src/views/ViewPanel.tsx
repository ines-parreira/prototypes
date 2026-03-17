import { Panel } from '@repo/layout'

import { ViewHeader } from './ViewHeader'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

type ViewPanelProps = {
    viewId: number
    onExpand?: () => void
}

export function ViewPanel({ viewId, onExpand }: ViewPanelProps) {
    return (
        <Panel name="views" config={panelConfig}>
            <ViewHeader viewId={viewId} onExpand={onExpand} />
        </Panel>
    )
}
